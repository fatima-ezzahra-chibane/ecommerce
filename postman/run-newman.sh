#!/usr/bin/env bash
# Tests Postman automatisés via Newman (Docker) — API doit tourner
set -euo pipefail
cd "$(dirname "$0")/.."

if ! curl -sf http://localhost:8080/api/v1/products >/dev/null; then
  echo "API inaccessible. Lance d'abord : docker compose up -d --no-build"
  exit 1
fi

NETWORK=$(docker inspect ecommerce-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}' 2>/dev/null || echo "ecommerce_default")

docker run --rm --network "$NETWORK" \
  -v "$(pwd)/postman:/etc/newman" \
  postman/newman:alpine \
  run Vivid-Ecommerce.postman_collection.json \
  -e Vivid-Local.postman_environment.json \
  --env-var "base_url=http://nginx/api/v1" \
  --folder "0. Smoke Test (Runner)" \
  --reporters cli
