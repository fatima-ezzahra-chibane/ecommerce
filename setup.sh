#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

if docker info >/dev/null 2>&1; then DC=(docker compose)
elif sudo docker info >/dev/null 2>&1; then DC=(sudo docker compose)
else echo "Docker inaccessible."; exit 1; fi

# Le backend dépend de mysql et cv-service « healthy » : au retour de up, les deux sont prêts.
echo "==> Démarrage de tous les services (premier lancement : plusieurs minutes)..."
"${DC[@]}" up -d --build

[ -f backend/.env ] || cp backend/.env.example backend/.env

if [ ! -f backend/vendor/autoload.php ]; then
  echo "==> Composer..."
  "${DC[@]}" exec backend rm -rf vendor 2>/dev/null || true
  "${DC[@]}" exec -e COMPOSER_PROCESS_TIMEOUT=0 backend composer install --no-interaction --prefer-dist
fi

echo "==> Migrations + seed..."
if ! grep -q '^APP_KEY=base64:' backend/.env; then
  "${DC[@]}" exec backend php artisan key:generate --force
fi
"${DC[@]}" exec backend php artisan migrate --force --seed
"${DC[@]}" exec backend php artisan storage:link 2>/dev/null || true
"${DC[@]}" exec backend chown -R www-data:www-data storage bootstrap/cache

echo "==> Indexation images produits (MobileNetV2 ONNX)..."
"${DC[@]}" exec backend php artisan products:index-visuals --fresh 2>/dev/null || echo "Indexation CV impossible (images inaccessibles ?). Relancer : docker compose exec backend php artisan products:index-visuals --fresh"

OWNER="${SUDO_USER:-$(whoami)}"
# storage/ reste à www-data (écriture des logs, du cache et des uploads par PHP-FPM)
chown -R "${OWNER}:${OWNER}" backend/vendor backend/.env 2>/dev/null || true

echo ""
echo "=== E-Commerce Platform ==="
echo "Frontend  : http://localhost:5173"
echo "API       : http://localhost:8080/api/v1"
echo "CV Service: http://localhost:8090/health"
echo "PhpMyAdmin: http://localhost:8082  (user: ecommerce / secret, accès local uniquement)"
echo ""
echo "Comptes demo:"
echo "  Admin  : admin@shop.com / password"
echo "  Client : client@shop.com / password"
