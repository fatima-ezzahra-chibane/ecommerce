"""Computer vision product matcher — OpenCV ORB (pas d'API cloud)."""

from __future__ import annotations

import pickle
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import cv2
import httpx
import numpy as np

MIN_GOOD_MATCHES = int(__import__("os").environ.get("CV_MIN_GOOD_MATCHES", "10"))
MATCH_RATIO = float(__import__("os").environ.get("CV_MATCH_RATIO", "0.8"))
MIN_CONFIDENCE_GAP = int(__import__("os").environ.get("CV_MIN_CONFIDENCE_GAP", "3"))
MAX_IMAGE_DIM = int(__import__("os").environ.get("CV_MAX_IMAGE_DIM", "800"))


@dataclass
class ProductFeatures:
    product_id: int
    keypoints_count: int
    descriptors: np.ndarray | None


class ProductMatcher:
    def __init__(self, index_path: Path) -> None:
        self.index_path = index_path
        self.orb = cv2.ORB_create(nfeatures=2500)
        self.matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
        self.index: dict[int, ProductFeatures] = {}
        self._load()

    def _load(self) -> None:
        if self.index_path.exists():
            with self.index_path.open("rb") as f:
                raw: dict[int, dict[str, Any]] = pickle.load(f)
            for pid, data in raw.items():
                desc = data.get("descriptors")
                self.index[int(pid)] = ProductFeatures(
                    product_id=int(pid),
                    keypoints_count=int(data.get("keypoints_count", 0)),
                    descriptors=desc,
                )

    def _save(self) -> None:
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        raw: dict[int, dict[str, Any]] = {}
        for pid, feat in self.index.items():
            raw[pid] = {
                "keypoints_count": feat.keypoints_count,
                "descriptors": feat.descriptors,
            }
        with self.index_path.open("wb") as f:
            pickle.dump(raw, f)

    @staticmethod
    def _decode_image(data: bytes) -> np.ndarray | None:
        arr = np.frombuffer(data, dtype=np.uint8)
        gray = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
        if gray is None or gray.size == 0:
            return None
        h, w = gray.shape[:2]
        max_dim = max(h, w)
        if max_dim > MAX_IMAGE_DIM:
            scale = MAX_IMAGE_DIM / max_dim
            gray = cv2.resize(
                gray,
                (int(w * scale), int(h * scale)),
                interpolation=cv2.INTER_AREA,
            )
        return gray

    def _extract(self, gray: np.ndarray | None) -> ProductFeatures | None:
        if gray is None or gray.size == 0:
            return None
        keypoints, descriptors = self.orb.detectAndCompute(gray, None)
        if descriptors is None or len(keypoints) < 8:
            return None
        return ProductFeatures(product_id=0, keypoints_count=len(keypoints), descriptors=descriptors)

    def index_from_bytes(self, product_id: int, data: bytes) -> bool:
        gray = self._decode_image(data)
        feat = self._extract(gray)
        if feat is None:
            self.index.pop(product_id, None)
            self._save()
            return False
        feat.product_id = product_id
        self.index[product_id] = feat
        self._save()
        return True

    async def index_from_url(self, product_id: int, image_url: str) -> bool:
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            return self.index_from_bytes(product_id, response.content)

    def _good_match_count(self, query_desc: np.ndarray, product_desc: np.ndarray) -> int:
        if query_desc is None or product_desc is None:
            return 0
        if len(query_desc) < 2 or len(product_desc) < 2:
            return 0
        try:
            pairs = self.matcher.knnMatch(query_desc, product_desc, k=2)
        except cv2.error:
            return 0
        good = 0
        for pair in pairs:
            if len(pair) < 2:
                continue
            m, n = pair
            if m.distance < MATCH_RATIO * n.distance:
                good += 1
        return good

    def search(self, data: bytes) -> dict[str, Any]:
        gray = self._decode_image(data)
        query = self._extract(gray)
        if query is None or query.descriptors is None:
            return {"product_id": None, "match_count": 0, "confidence": 0.0}

        if not self.index:
            return {"product_id": None, "match_count": 0, "confidence": 0.0}

        scores: list[tuple[int, int]] = []
        for pid, feat in self.index.items():
            if feat.descriptors is None:
                continue
            count = self._good_match_count(query.descriptors, feat.descriptors)
            if count > 0:
                scores.append((pid, count))

        if not scores:
            return {"product_id": None, "match_count": 0, "confidence": 0.0}

        scores.sort(key=lambda x: x[1], reverse=True)
        best_id, best_count = scores[0]
        second_count = scores[1][1] if len(scores) > 1 else 0

        if best_count < MIN_GOOD_MATCHES:
            return {"product_id": None, "match_count": best_count, "confidence": 0.0}

        if len(scores) > 1 and (best_count - second_count) < MIN_CONFIDENCE_GAP:
            return {"product_id": None, "match_count": best_count, "confidence": 0.0}

        confidence = min(1.0, best_count / max(query.keypoints_count, 1))
        return {
            "product_id": best_id,
            "match_count": best_count,
            "confidence": round(confidence, 4),
        }

    def stats(self) -> dict[str, Any]:
        return {
            "indexed_products": len(self.index),
            "min_good_matches": MIN_GOOD_MATCHES,
            "match_ratio": MATCH_RATIO,
        }

    def clear(self) -> None:
        self.index = {}
        if self.index_path.exists():
            self.index_path.unlink()
