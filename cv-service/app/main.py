import os
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, HttpUrl

from app.matcher import ProductMatcher

INDEX_PATH = Path(os.environ.get("CV_INDEX_PATH", "/data/index.pkl"))
matcher = ProductMatcher(INDEX_PATH)

app = FastAPI(title="Vivid CV Service", version="1.0.0")


class IndexUrlBody(BaseModel):
    product_id: int
    image_url: HttpUrl


@app.get("/health")
def health():
    stats = matcher.stats()
    return {"status": "ok", **stats}


@app.post("/index/url")
async def index_url(body: IndexUrlBody):
    ok = await matcher.index_from_url(body.product_id, str(body.image_url))
    if not ok:
        raise HTTPException(422, "Impossible d'indexer l'image (pas assez de descripteurs visuels).")
    return {"product_id": body.product_id, "indexed": True}


@app.post("/index/file")
async def index_file(product_id: int, file: UploadFile = File(...)):
    data = await file.read()
    ok = matcher.index_from_bytes(product_id, data)
    if not ok:
        raise HTTPException(422, "Impossible d'indexer l'image.")
    return {"product_id": product_id, "indexed": True}


@app.post("/search")
async def search(file: UploadFile = File(...)):
    data = await file.read()
    if not data:
        raise HTTPException(422, "Image vide.")
    return matcher.search(data)


@app.delete("/index")
def clear_index():
    matcher.clear()
    return {"cleared": True}
