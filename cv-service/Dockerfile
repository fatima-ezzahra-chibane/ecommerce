FROM python:3.11-slim-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV CV_INDEX_PATH=/data/index.pkl
ENV CV_MIN_GOOD_MATCHES=18
ENV CV_MATCH_RATIO=0.75
ENV CV_MIN_CONFIDENCE_GAP=5

EXPOSE 8090

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8090"]
