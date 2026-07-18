"""Computer vision — embeddings MobileNetV2 (ONNX) pour photos réelles.

Reconnaît le même produit même photographié ailleurs (autre lieu / fond / angle),
tout en rejetant les images aléatoires via un seuil de similarité + écart.

Pas de PyTorch (trop lourd) : ONNX Runtime + MobileNetV2 ImageNet.
"""

from __future__ import annotations

import io
import pickle
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import httpx
import numpy as np
import onnxruntime as ort
from PIL import Image

MIN_SIMILARITY = float(__import__("os").environ.get("CV_MIN_SIMILARITY", "0.72"))
MIN_SIMILARITY_GAP = float(__import__("os").environ.get("CV_MIN_SIMILARITY_GAP", "0.035"))
MAX_IMAGE_DIM = int(__import__("os").environ.get("CV_MAX_IMAGE_DIM", "1024"))

# MobileNetV2 ONNX (ImageNet) — couche pooling → vecteur 1280-d
MODEL_URL = __import__("os").environ.get(
    "CV_ONNX_URL",
    "https://github.com/onnx/models/raw/main/validated/vision/classification/mobilenet/model/mobilenetv2-12.onnx",
)
MODEL_PATH = Path(__import__("os").environ.get("CV_ONNX_PATH", "/app/models/mobilenetv2-12.onnx"))


def _ensure_model(path: Path) -> Path:
    if path.exists() and path.stat().st_size > 1_000_000:
        return path
    # Si le fichier monté n'existe pas, tenter un téléchargement (dev)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".download")
    try:
        urllib.request.urlretrieve(MODEL_URL, tmp)
        tmp.replace(path)
    except Exception as exc:
        raise RuntimeError(
            f"Modèle ONNX introuvable ({path}). Placez mobilenetv2-12.onnx dans cv-service/models/. ({exc})"
        ) from exc
    return path


@dataclass
class ProductFeatures:
    product_id: int
    embedding: np.ndarray


class EmbeddingEncoder:
    """MobileNetV2 ONNX → embedding (sortie avant softmax / global pool)."""

    def __init__(self, model_path: Path = MODEL_PATH) -> None:
        path = _ensure_model(model_path)
        self.session = ort.InferenceSession(str(path), providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        # Sortie classification 1000-d : on l'utilise comme embedding (suffisant pour similarité)
        self.output_name = self.session.get_outputs()[0].name

    @staticmethod
    def _preprocess(img: Image.Image) -> np.ndarray:
        img = img.convert("RGB")
        w, h = img.size
        max_dim = max(w, h)
        if max_dim > MAX_IMAGE_DIM:
            scale = MAX_IMAGE_DIM / max_dim
            img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

        # Deux vues : center-crop (produit centré) + resize (photo libre)
        def to_nchw(pil_img: Image.Image) -> np.ndarray:
            resized = pil_img.resize((224, 224), Image.Resampling.BILINEAR)
            arr = np.asarray(resized).astype(np.float32) / 255.0
            # ImageNet normalize
            mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
            std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
            arr = (arr - mean) / std
            return np.transpose(arr, (2, 0, 1))[None, ...]  # 1x3x224x224

        # Center crop 80%
        w, h = img.size
        side = int(min(w, h) * 0.85)
        left = (w - side) // 2
        top = (h - side) // 2
        crop = img.crop((left, top, left + side, top + side))

        return to_nchw(crop), to_nchw(img)

    def _run(self, batch: np.ndarray) -> np.ndarray:
        out = self.session.run([self.output_name], {self.input_name: batch})[0]
        vec = out.reshape(-1).astype(np.float32)
        # Softmax logits → L2 normalize for cosine
        vec = vec / (np.linalg.norm(vec) + 1e-8)
        return vec

    def encode(self, data: bytes) -> np.ndarray | None:
        try:
            img = Image.open(io.BytesIO(data)).convert("RGB")
        except Exception:
            return None
        try:
            b1, b2 = self._preprocess(img)
            e1 = self._run(b1)
            e2 = self._run(b2)
            emb = e1 + e2
            emb = emb / (np.linalg.norm(emb) + 1e-8)
            return emb
        except Exception:
            return None


class ProductMatcher:
    def __init__(self, index_path: Path) -> None:
        self.index_path = index_path
        self.encoder = EmbeddingEncoder()
        self.index: dict[int, ProductFeatures] = {}
        self._load()

    def _load(self) -> None:
        if not self.index_path.exists():
            return
        with self.index_path.open("rb") as f:
            raw: dict[int, dict[str, Any]] = pickle.load(f)
        for pid, data in raw.items():
            emb = data.get("embedding")
            if emb is None:
                continue
            arr = np.asarray(emb, dtype=np.float32).ravel()
            if arr.size < 64:
                continue
            arr = arr / (np.linalg.norm(arr) + 1e-8)
            self.index[int(pid)] = ProductFeatures(product_id=int(pid), embedding=arr)

    def _save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        raw = {pid: {"embedding": feat.embedding} for pid, feat in self.index.items()}
        with self.index_path.open("wb") as f:
            pickle.dump(raw, f)

    def index_from_bytes(self, product_id: int, data: bytes) -> bool:
        emb = self.encoder.encode(data)
        if emb is None:
            self.index.pop(product_id, None)
            self._save()
            return False
        self.index[product_id] = ProductFeatures(product_id=product_id, embedding=emb)
        self._save()
        return True

    async def index_from_url(self, product_id: int, image_url: str) -> bool:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            return self.index_from_bytes(product_id, response.content)

    def search(self, data: bytes) -> dict[str, Any]:
        query = self.encoder.encode(data)
        if query is None:
            return {"product_id": None, "match_count": 0, "confidence": 0.0, "reason": "no_features"}

        if not self.index:
            return {"product_id": None, "match_count": 0, "confidence": 0.0, "reason": "empty_index"}

        scores = [
            (pid, float(np.dot(query, feat.embedding)))
            for pid, feat in self.index.items()
        ]
        scores.sort(key=lambda x: x[1], reverse=True)
        best_id, best_sim = scores[0]
        second_sim = scores[1][1] if len(scores) > 1 else 0.0

        if best_sim < MIN_SIMILARITY:
            return {
                "product_id": None,
                "match_count": 0,
                "confidence": round(best_sim, 4),
                "reason": "below_threshold",
                "best_similarity": round(best_sim, 4),
            }

        if len(scores) > 1 and (best_sim - second_sim) < MIN_SIMILARITY_GAP:
            return {
                "product_id": None,
                "match_count": 0,
                "confidence": round(best_sim, 4),
                "reason": "ambiguous",
                "best_similarity": round(best_sim, 4),
                "second_similarity": round(second_sim, 4),
            }

        return {
            "product_id": best_id,
            "match_count": 1,
            "confidence": round(best_sim, 4),
            "reason": "match",
            "similarity": round(best_sim, 4),
        }

    def stats(self) -> dict[str, Any]:
        return {
            "indexed_products": len(self.index),
            "method": "mobilenetv2_onnx_embedding",
            "min_similarity": MIN_SIMILARITY,
            "min_similarity_gap": MIN_SIMILARITY_GAP,
        }

    def clear(self) -> None:
        self.index = {}
        if self.index_path.exists():
            self.index_path.unlink()
