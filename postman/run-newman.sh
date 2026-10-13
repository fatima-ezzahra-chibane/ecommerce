#!/usr/bin/env bash
# Tests Postman automatisés via Newman (Docker) — les conteneurs doivent tourner.
# Le parcours crée une commande : il s'exécute sur une base temporaire (ecommerce_newman),
# supprimée à la fin, pour ne jamais toucher aux données de la base ecommerce.
set -euo pipefail
cd "$(dirname "$0")/.."

TEST_DB=ecommerce_newman
PORT=8001

if ! docker compose exec -T backend true 2>/dev/null; then
  echo "Conteneurs arrêtés. Lance d'abord : docker compose up -d --no-build"
  exit 1
fi

cleanup() {
  docker compose exec -T backend sh -c "for p in /proc/[0-9]*; do grep -q 'serve' \$p/cmdline 2>/dev/null && grep -q '$PORT' \$p/cmdline && kill \${p#/proc/}; done; true" || true
  docker compose exec -T mysql mysql -uroot -proot -e "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null || true
}
trap cleanup EXIT

echo "==> Base temporaire $TEST_DB"
docker compose exec -T mysql mysql -uroot -proot \
  -e "DROP DATABASE IF EXISTS $TEST_DB; CREATE DATABASE $TEST_DB; GRANT ALL ON $TEST_DB.* TO 'ecommerce'@'%';" 2>/dev/null
docker compose exec -T -e DB_DATABASE=$TEST_DB backend php artisan migrate --seed --force >/dev/null

echo "==> API de test sur backend:$PORT"
docker compose exec -d -e DB_DATABASE=$TEST_DB backend php artisan serve --host=0.0.0.0 --port=$PORT
for i in $(seq 1 20); do
  docker compose exec -T backend php -r "exit(@file_get_contents('http://127.0.0.1:$PORT/api/v1/categories') ? 0 : 1);" && break
  [ "$i" -eq 20 ] && { echo "API de test injoignable."; exit 1; }
  sleep 1
done

NETWORK=$(docker inspect ecommerce-backend --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}}{{end}}')

docker run --rm --network "$NETWORK" \
  -v "$(pwd)/postman:/etc/newman" \
  postman/newman:alpine \
  run Vivid-Ecommerce.postman_collection.json \
  -e Vivid-Local.postman_environment.json \
  --env-var "base_url=http://backend:$PORT/api/v1" \
  --folder "0. Smoke Test (Runner)" \
  --reporters cli
