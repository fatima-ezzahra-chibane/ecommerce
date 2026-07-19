# Soutenance PFE — Vivid E-Commerce

**Statut : projet PFE terminé et démontrable.**

## Périmètre livré

| Module | Statut |
|--------|--------|
| API REST Laravel 12 + Sanctum | Terminé |
| Boutique web React 19 + admin | Terminé |
| App mobile Expo (React Native) | Terminé |
| Panier, commandes, favoris, avis, coupons | Terminé |
| Recherche par image (CV MobileNetV2 ONNX) | Terminé |
| Recommandations produits | Terminé |
| Contact client WhatsApp (web + mobile) | Terminé |
| Docker Compose (API, Nginx, MySQL, frontend, CV) | Terminé |
| CI GitHub Actions (PHPUnit + Vitest) | Terminé |
| Tests E2E Cypress (parcours checkout, local) | Terminé |
| Paiement | Simulé (hors périmètre PFE) |

## Démarrage démo (5 minutes)

```bash
# 1. Stack
cp backend/.env.example backend/.env   # si besoin
docker compose up -d --build

# 2. Backend
docker compose exec backend composer install --no-interaction
docker compose exec backend php artisan key:generate --force
docker compose exec backend php artisan migrate --force --seed
docker compose exec backend php artisan products:index-visuals --fresh

# 3. URLs
# Boutique  http://localhost:5173
# API       http://localhost:8080/api/v1
# PhpMyAdmin http://localhost:8082
# CV health http://localhost:8090/health
```

Comptes : `admin@shop.com` / `password` — `client@shop.com` / `password`

## Mobile

```bash
cd mobile
API_HOST_IP=<IP_LAN_DU_PC> ./start.sh
```

## Tests

```bash
# CI / unitaires
docker compose exec backend php artisan test
cd frontend && npm ci --include=dev && npx vitest run

# E2E local (stack Docker déjà up)
cd frontend && npm run cy:run
```

CI : à chaque push sur `main` → **PHPUnit** + **Vitest** (Cypress volontairement hors CI : trop lourd sur le runner).

## Points à présenter en soutenance

1. Architecture API unique consommée par web + mobile  
2. Microservice CV (Python) découplé de Laravel  
3. Qualité : Form Requests, repositories, rate limiting, Sanctum 24h  
4. CI verte sur GitHub Actions  
5. Parcours client complet + dashboard admin  

## Docs

- Audit technique : [`AUDIT_COMPLET.md`](AUDIT_COMPLET.md)  
- Base de données : [`BASE_DE_DONNEES.md`](BASE_DE_DONNEES.md)  
- README racine : [`../README.md`](../README.md)
