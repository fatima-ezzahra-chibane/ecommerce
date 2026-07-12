#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if docker info >/dev/null 2>&1; then DC=(docker compose)
elif sudo docker info >/dev/null 2>&1; then DC=(sudo docker compose)
else echo "Docker inaccessible."; exit 1; fi

echo "==> Démarrage de tous les services..."
"${DC[@]}" up -d --build backend nginx frontend mysql phpmyadmin

echo "==> Attente MySQL..."
for i in $(seq 1 36); do
  "${DC[@]}" exec mysql mysqladmin ping -h 127.0.0.1 -uroot -proot --silent 2>/dev/null && break
  [ "$i" -eq 36 ] && { echo "MySQL ne répond pas."; exit 1; }
  sleep 5
done
echo "MySQL prêt."

[ -f backend/.env ] || cp backend/.env.example backend/.env

if [ ! -f backend/vendor/autoload.php ]; then
  echo "==> Composer..."
  "${DC[@]}" exec backend rm -rf vendor 2>/dev/null || true
  "${DC[@]}" exec -e COMPOSER_PROCESS_TIMEOUT=0 backend composer install --no-interaction --prefer-dist --no-dev
fi

echo "==> Migrations + seed..."
"${DC[@]}" exec backend php artisan key:generate --force 2>/dev/null || true
"${DC[@]}" exec backend php artisan migrate --force --seed
"${DC[@]}" exec backend php artisan storage:link 2>/dev/null || true
"${DC[@]}" exec backend chown -R www-data:www-data storage bootstrap/cache

OWNER="${SUDO_USER:-$(whoami)}"
chown -R "${OWNER}:${OWNER}" backend/vendor backend/.env backend/storage 2>/dev/null || true

echo ""
echo "=== E-Commerce Platform ==="
echo "Frontend  : http://localhost:5173"
echo "API       : http://localhost:8080/api/v1"
echo "PhpMyAdmin: http://localhost:8081  (user: ecommerce / secret)"
echo ""
echo "Comptes demo:"
echo "  Admin  : admin@shop.com / password"
echo "  Client : client@shop.com / password"
