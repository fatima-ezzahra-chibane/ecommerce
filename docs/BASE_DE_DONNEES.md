# Schéma de la base de données

Base : **ecommerce** (MySQL 8)

## Tables métier

### users
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Clé primaire |
| name | string | Nom complet |
| email | string | Email unique |
| password | string | Hash bcrypt |
| phone | string | Téléphone |
| role | enum | `user` ou `admin` |
| is_active | boolean | Compte actif |
| email_verified_at | timestamp | Vérification email |

### categories
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Clé primaire |
| name | string | Nom catégorie |
| slug | string | URL-friendly |

### products
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Clé primaire |
| category_id | FK → categories | Catégorie |
| name, slug | string | Nom et slug |
| description | text | Description |
| price | decimal(10,2) | Prix |
| stock | int | Stock disponible |
| image | string | Chemin image unique |
| status | enum | `active` / `inactive` |

### carts / cart_items
- Un **panier** par utilisateur (`carts.user_id`)
- **Lignes** : produit + quantité (`cart_items`)

### wishlists
- Association `user_id` + `product_id` (favoris)

### orders / order_items
- **Commande** : total, statut, adresse, coupon, remise
- **Lignes** : produit, quantité, prix au moment de l'achat

### payments
- Paiement lié à une commande (simulé : `status: completed`)

### reviews
- Avis utilisateur sur un produit (note, commentaire, image optionnelle)

### coupons
- Code promo (`WELCOME10` en seed), type pourcentage ou fixe

## Relations principales

```
users ──┬── carts ── cart_items ── products
        ├── wishlists ── products
        ├── orders ── order_items ── products
        ├── reviews ── products
        └── payments (via orders)

categories ── products
```

## Tables techniques Laravel

- `personal_access_tokens` — tokens Sanctum
- `cache`, `jobs` — infrastructure Laravel
