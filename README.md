# E-Commerce Platform — Laravel 12 + React 19

Plateforme e-commerce full-stack professionnelle.

## Stack

| Couche | Technologie |
|--------|-------------|
| Backend | Laravel 12, Sanctum, Repository Pattern |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| BDD | MySQL 8 |
| Docker | PHP-FPM, Nginx, Node, MySQL, PhpMyAdmin (BDD) |

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
| http://localhost:8081 | PhpMyAdmin (BDD) |

## Accès à la base de données

Les conteneurs Docker doivent être démarrés (`docker compose up -d` ou `./setup.sh`).

### PhpMyAdmin (port 8081, démarré par défaut)

1. Ouvre **http://localhost:8081**
2. Si un écran de connexion s’affiche :
   - **Serveur** : `mysql`
   - **Utilisateur** : `ecommerce`
   - **Mot de passe** : `secret`
3. Dans le panneau de gauche, clique sur la base **`ecommerce`**

Compte **root** (accès complet) : utilisateur `root`, mot de passe `root`.

### Ligne de commande MySQL

```bash
docker compose exec mysql mysql -u ecommerce -psecret ecommerce
```

Ou en root :

```bash
docker compose exec mysql mysql -u root -proot ecommerce
```

Commandes utiles : `SHOW TABLES;`, `SELECT * FROM users;`, `exit` pour quitter.

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

## Tests API (Postman / Newman)

1. Importer dans Postman :
   - `postman/Vivid-Ecommerce.postman_collection.json`
   - `postman/Vivid-Local.postman_environment.json`
2. Lancer le dossier **« 0. Smoke Test (Runner) »** dans Postman

En ligne de commande (API Docker démarrée) :

```bash
chmod +x postman/run-newman.sh
./postman/run-newman.sh
```

## Phase 1 — Consolidation (terminée)

| Livrable | Statut |
|----------|--------|
| Git / GitHub (`main`) | OK |
| Tests PHPUnit (26) | OK |
| Tests Postman automatisés + Newman | OK |
| Documentation soutenance (`docs/`) | OK |

## Phase 2 — Qualité & CI (terminée)

| Livrable | Statut |
|----------|--------|
| Tests frontend (Vitest + Testing Library) | OK |
| Tests E2E Cypress (parcours checkout) | OK |
| GitHub Actions CI | OK |

### Tests frontend (Vitest)

```bash
docker compose exec frontend npm test
```

Fichiers : `LoginPage.test.jsx`, `ProtectedRoute.test.jsx`, `ProductCard.test.jsx`

### Tests E2E (Cypress)

Stack Docker démarrée, puis :

```bash
docker compose exec frontend npm run cy:run
```

Interface graphique : `docker compose exec frontend npm run cy:open`

### CI GitHub Actions

À chaque push sur `main` : PHPUnit + Vitest + Cypress E2E.

Fichier : `.github/workflows/ci.yml`

Prochaine étape : **Phase 3** — Application mobile React Native.

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
