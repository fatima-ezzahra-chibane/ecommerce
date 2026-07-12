# Audit complet — Plateforme Vivid (Phase 1)

## 1. Fonctionnel

| Module | Statut | Endpoints clés |
|--------|--------|----------------|
| Auth | OK | register, login, logout, me |
| Catalogue | OK | products, categories |
| Panier | OK | CRUD cart |
| Commandes | OK | checkout, historique |
| Favoris | OK | wishlist CRUD |
| Avis | OK | reviews sur produits |
| Profil | OK | update profile/password |
| Admin | OK | dashboard, CRUD, users, coupons |
| Paiement | Simulé | enregistrement sans PSP réel |

## 2. Sécurité

- Mots de passe hashés (bcrypt)
- Tokens Sanctum avec expiration
- Middleware `auth:sanctum` sur routes protégées
- Middleware `admin` sur routes `/admin/*`
- Validation des requêtes (Form Requests)
- CORS configuré pour le frontend

## 3. Base de données

- 15 migrations, relations FK cohérentes
- Seeders : comptes démo, produits, catégories, coupon `WELCOME10`
- Détail : [`BASE_DE_DONNEES.md`](BASE_DE_DONNEES.md)

## 4. Docker

| Service | Image / Build | Port |
|---------|---------------|------|
| backend | docker/php | interne |
| nginx | nginx:alpine | 8080 |
| frontend | docker/node | 5173 |
| mysql | mysql:8.0 | 3307 |
| phpmyadmin | phpmyadmin:5.2 | 8081 |

Script d'installation : `setup.sh`

## 5. Tests (Phase 1)

### PHPUnit — 26 tests

```bash
docker compose exec backend php artisan test
```

| Fichier | Couverture |
|---------|------------|
| AuthTest | register, login, logout, me, compte inactif |
| CartTest | add, update, remove, guest denied |
| CheckoutTest | panier vide, commande, coupon, stock |
| WishlistTest | add, remove, guest denied |
| AdminAccessTest | user denied, admin allowed |
| ApiHealthTest | /up, API root, produits publics |

### Postman / Newman

Collection : `postman/Vivid-Ecommerce.postman_collection.json`  
Environnement : `postman/Vivid-Local.postman_environment.json`

```bash
chmod +x postman/run-newman.sh
./postman/run-newman.sh
```

Dossier **« 0. Smoke Test (Runner) »** : parcours automatisé auth → panier → commande → admin.

## 6. Git / GitHub

- Dépôt : https://github.com/fatima-ezzahra-chibane/ecommerce
- Branche : `main`
- Workflow documenté dans README

## 7. Phase 1 — Bilan

| Livrable | Statut |
|----------|--------|
| Git / GitHub | Terminé |
| Tests backend PHPUnit | Terminé (26 tests) |
| Tests Postman automatisés | Terminé (Runner + Newman) |
| Documentation soutenance | Terminé (`docs/`) |

## 8. Phase 2 — Qualité & CI

| Livrable | Statut |
|----------|--------|
| Vitest + Testing Library | Terminé (LoginPage, ProtectedRoute, ProductCard) |
| Cypress E2E | Terminé (login → panier → checkout) |
| GitHub Actions | Terminé (`.github/workflows/ci.yml`) |

```bash
docker compose exec frontend npm test
docker compose exec frontend npm run cy:run
```

## 9. Prochaines phases

- **Phase 3** : React Native
- **Phase 4** : IA (vision, recommandations, chatbot)
- **Phase 5** : Stripe (paiement réel)
