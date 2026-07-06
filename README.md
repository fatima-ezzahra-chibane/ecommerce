# E-Commerce Platform — Laravel 12 + React 19

Plateforme e-commerce full-stack professionnelle.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 12, Sanctum, Repository Pattern |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| BDD | MySQL 8 |
| Docker | PHP-FPM, Nginx, Node, MySQL, PhpMyAdmin |

## Démarrage

```bash
chmod +x setup.sh fix-docker.sh
./setup.sh
```

| URL | Service |
|-----|---------|
| http://localhost:5173 | React (boutique) |
| http://localhost:8080/api/v1 | API REST |
| http://localhost:8081 | Adminer (BDD, léger) |
| http://localhost:8082 | PhpMyAdmin (`docker compose --profile phpmyadmin up -d phpmyadmin`) |

## Comptes démo

- **Admin** : `admin@shop.com` / `password`
- **Client** : `client@shop.com` / `password`

## Git / GitHub

Dépôt : https://github.com/fatima-ezzahra-chibane/ecommerce.git

Branche unique : **`main`** (tout le développement se fait sur cette branche).

```bash
git clone https://github.com/fatima-ezzahra-chibane/ecommerce.git
cd ecommerce
```

Workflow :

```bash
git pull origin main
# ... modifications ...
git add .
git commit -m "feat: description du changement"
git push origin main
```

Première configuration du remote :

```bash
git remote add origin https://github.com/fatima-ezzahra-chibane/ecommerce.git
git push -u origin main
```

## Tests backend (PHPUnit)

```bash
docker compose exec backend php artisan test
```

Couverture : authentification, panier, checkout, favoris, accès admin, santé API.

| Fichier | Scénarios testés |
|---------|------------------|
| `AuthTest.php` | register, login, logout, /me, compte inactif |
| `CartTest.php` | ajout, quantité, mise à jour, suppression |
| `CheckoutTest.php` | panier vide, commande, coupon, stock |
| `WishlistTest.php` | ajout / retrait favoris |
| `AdminAccessTest.php` | accès refusé user, accès admin |
| `ApiHealthTest.php` | /up, racine API, produits publics |

## Structure

```
├── backend/          Laravel API
├── frontend/         React SPA
├── docker/           Dockerfiles + Nginx
├── docs/             Documentation
└── docker-compose.yml
```

Voir `docs/` pour l'architecture, l'API et les diagrammes UML.

**Audit complet (PFE / tech lead) :** [`docs/AUDIT_COMPLET.md`](docs/AUDIT_COMPLET.md) — fonctionnel, sécurité, BDD, Docker, endpoints, PlantUML (`docs/plantuml/`).
