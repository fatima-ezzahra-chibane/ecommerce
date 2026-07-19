# E-Commerce Platform — Vivid (PFE)

Plateforme e-commerce full-stack : **Laravel 12 + React 19 + Expo + CV (MobileNetV2) + Docker**.

**Statut PFE : terminé** — voir [`docs/SOUTENANCE.md`](docs/SOUTENANCE.md).

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 12, Sanctum, Repository Pattern |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Mobile | React Native (Expo) |
| CV | Python FastAPI + MobileNetV2 ONNX |
| BDD | MySQL 8 |
| Docker | PHP-FPM, Nginx, Node, MySQL, PhpMyAdmin, cv-service |

## Démarrage

```bash
chmod +x setup.sh
./setup.sh
```

Démarrage rapide (projet déjà installé) :

```bash
docker compose up -d --no-build
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | React (boutique) |
| http://localhost:8080/api/v1 | API REST |
| http://localhost:8082 | PhpMyAdmin (BDD) |
| http://localhost:8090/health | CV service |

## Accès à la base de données

Les conteneurs Docker doivent être démarrés (`docker compose up -d` ou `./setup.sh`).

### PhpMyAdmin (port 8082)

1. Ouvre **http://localhost:8082**
2. Connexion : serveur `mysql`, user `ecommerce`, mot de passe `secret`
3. Base **`ecommerce`**

Root : `root` / `root`.

```bash
docker compose exec mysql mysql -u ecommerce -psecret ecommerce
```

## Comptes démo

- **Admin** : `admin@shop.com` / `password`
- **Client** : `client@shop.com` / `password`

## Git / GitHub

Dépôt : https://github.com/fatima-ezzahra-chibane/ecommerce.git — branche **`main`**.

## Tests backend (PHPUnit)

```bash
docker compose exec backend php artisan test
```

Couverture : Auth, Cart, Checkout, Wishlist, Admin, Health, AI.

## Tests API (Postman / Newman)

```bash
chmod +x postman/run-newman.sh
./postman/run-newman.sh
```

## Phase 1 — Consolidation (terminée)

Git/GitHub, PHPUnit, Postman, documentation.

## Phase 2 — Qualité & CI (terminée)

| Livrable | Statut |
|----------|--------|
| Vitest | OK (CI) |
| Cypress E2E checkout | OK (**local**) |
| GitHub Actions | OK (PHPUnit + Vitest) |

### Vitest

```bash
cd frontend && npm ci --include=dev && npx vitest run
```

### Cypress E2E (local — stack Docker up)

```bash
cd frontend
npm ci --include=dev
npm run cy:run
```

### CI GitHub Actions

À chaque push sur `main` : **PHPUnit + Vitest** (`.github/workflows/ci.yml`).  
Cypress reste volontairement **hors CI** (trop lourd sur le runner).

## Phase 3 — Mobile React Native (terminée)

```bash
cd mobile
chmod +x start.sh
API_HOST_IP=VOTRE_IP ./start.sh
```

Voir [`mobile/README.md`](mobile/README.md).

## Phase 4 — IA & contact (terminée)

| Livrable | Statut |
|----------|--------|
| Computer vision (MobileNetV2 ONNX) | OK |
| Recherche photo → produit ou rien | OK |
| Bouton WhatsApp (web + mobile) | OK |
| Recommandations produits | OK |
| API `/api/v1/ai/*` | OK |

```bash
docker compose up -d --build cv-service
docker compose exec backend php artisan products:index-visuals --fresh
```

WhatsApp : `frontend/src/config/whatsapp.js` et `mobile/src/config/whatsapp.js`.  
CV : [`cv-service/README.md`](cv-service/README.md).

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/v1/ai/status` | État CV |
| POST | `/api/v1/ai/search-image` | Recherche par image |
| GET | `/api/v1/ai/recommendations` | Recommandations |
| GET | `/api/v1/products/{id}/recommendations` | Produits similaires |

## Structure

```
├── backend/          Laravel API
├── frontend/         React SPA
├── mobile/           React Native (Expo)
├── cv-service/       Microservice CV
├── docker/           Dockerfiles + Nginx
├── docs/             Documentation PFE
└── docker-compose.yml
```

- Soutenance : [`docs/SOUTENANCE.md`](docs/SOUTENANCE.md)
- Audit : [`docs/AUDIT_COMPLET.md`](docs/AUDIT_COMPLET.md)
- BDD : [`docs/BASE_DE_DONNEES.md`](docs/BASE_DE_DONNEES.md)
