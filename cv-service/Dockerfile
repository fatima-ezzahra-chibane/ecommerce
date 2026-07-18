FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV CV_INDEX_PATH=/data/index.pkl
ENV CV_MIN_SIMILARITY=0.72
ENV CV_MIN_SIMILARITY_GAP=0.035
ENV CV_MAX_IMAGE_DIM=1024
ENV CV_ONNX_PATH=/app/models/mobilenetv2-12.onnx

EXPOSE 8090

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
