# Architecture — Plateforme Vivid

## Vue d'ensemble

```
┌─────────────┐     HTTP/JSON      ┌─────────────┐     FastCGI     ┌─────────────┐
│   React     │ ─────────────────► │   Nginx     │ ──────────────► │  Laravel    │
│  (Vite)     │   Bearer token     │   :8080     │                 │  PHP-FPM    │
│  :5173      │                    └─────────────┘                 └──────┬──────┘
└─────────────┘                                                           │
                                                                          ▼
                                                                   ┌─────────────┐
                                                                   │   MySQL 8   │
                                                                   │  :3307      │
                                                                   └─────────────┘
```

## Couches backend (Laravel)

| Couche | Rôle | Exemple |
|--------|------|---------|
| **Route** | URL → contrôleur | `POST /api/v1/orders` |
| **Controller** | Valide la requête, renvoie JSON | `OrderController` |
| **Service** | Logique métier | `OrderService` (stock, coupon, paiement) |
| **Repository** | Accès BDD | `OrderRepository` |
| **Model** | Entité Eloquent | `Order`, `Product` |
| **Resource** | Format JSON de sortie | `OrderResource` |

## Authentification (Sanctum)

1. `POST /login` → retourne un **token Bearer**
2. Le frontend stocke le token (`localStorage`)
3. Chaque requête protégée envoie : `Authorization: Bearer {token}`
4. Middleware `auth:sanctum` vérifie le token
5. Middleware `admin` restreint les routes `/admin/*`

## Frontend (React)

| Dossier | Rôle |
|---------|------|
| `contexts/` | État global (auth, panier) |
| `services/api.js` | Client Axios + intercepteurs |
| `pages/` | Pages (Shop, Cart, Checkout, Admin…) |
| `components/` | Composants réutilisables |
| `App.jsx` | Routes React Router |

## Docker

| Service | Port | Rôle |
|---------|------|------|
| frontend | 5173 | Vite dev server |
| nginx | 8080 | Reverse proxy API |
| backend | — | PHP-FPM Laravel |
| mysql | 3307 | Base de données |
| phpmyadmin | 8081 | Interface BDD |

## Flux principaux

- **Achat** : Catalogue → Panier → Checkout → Commande → Paiement simulé
- **Admin** : Dashboard → CRUD produits/catégories → Gestion commandes/utilisateurs
- **Favoris** : Ajout/retrait produits en wishlist

Voir aussi : [`BASE_DE_DONNEES.md`](BASE_DE_DONNEES.md), [`plantuml/`](plantuml/).
