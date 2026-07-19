# Audit Technique Complet — Plateforme E-commerce Vivid

> **Projet PFE** — Fatima Ezzahra Chibane  
> **Stack** : Laravel 12 + React 19 + React Native (Expo 54) + MySQL 8 + Docker + Python (CV)  
> **Dépôt** : https://github.com/fatima-ezzahra-chibane/ecommerce.git

---

## Table des matières

1. [Architecture globale](#1-architecture-globale)
2. [Audit du backend Laravel](#2-audit-du-backend-laravel)
3. [Analyse de la base de données](#3-analyse-de-la-base-de-données)
4. [Analyse du frontend React](#4-analyse-du-frontend-react)
5. [Analyse de l'application mobile React Native](#5-analyse-de-lapplication-mobile-react-native)
6. [Analyse Docker](#6-analyse-docker)
7. [Analyse réseau](#7-analyse-réseau)
8. [Analyse de la qualité du code](#8-analyse-de-la-qualité-du-code)
9. [Vérification des bonnes pratiques](#9-vérification-des-bonnes-pratiques)
10. [Documentation finale de soutenance](#10-documentation-finale-de-soutenance)

---

## 1. Architecture globale

### 1.1 Vue d'ensemble

```
┌─────────────────┐     ┌──────────────────┐
│   React Web     │     │  React Native    │
│   (Vite :5173)  │     │  (Expo Go :8081) │
└────────┬────────┘     └────────┬─────────┘
         │    HTTP/JSON + Bearer token    │
         └────────────┬──────────────────┘
                      ▼
              ┌──────────────┐
              │    Nginx     │ :8080 (reverse proxy)
              │  (static +   │
              │   FastCGI)   │
              └──────┬───────┘
                     ▼
              ┌──────────────┐     HTTP      ┌──────────────┐
              │   Laravel    │ ──────────▶  │  cv-service   │
              │   PHP-FPM   │              │  Python :8090  │
              │   (API)     │ ◀──────────  │  MobileNetV2  │
              └──────┬───────┘              └──────────────┘
                     ▼                            │
              ┌──────────────┐              ┌─────┴──────┐
              │   MySQL 8    │              │ index.pkl  │
              │   :3307      │              │ (Volume)   │
              └──────────────┘              └────────────┘
```

### 1.2 Rôle de chaque partie

| Composant | Rôle |
|-----------|------|
| **React Web** | Boutique client + dashboard admin (SPA) |
| **React Native** | App mobile client (Expo Go) |
| **Nginx** | Reverse proxy, sert les fichiers statiques Laravel, transmet PHP à FPM |
| **Laravel** | API REST, logique métier, authentification Sanctum |
| **cv-service** | Microservice de computer vision (recherche image, MobileNetV2 ONNX) |
| **MySQL** | Base de données relationnelle |
| **PhpMyAdmin** | Interface web d'administration BDD |

### 1.3 Parcours complet d'une requête — Web

```
Navigateur (client)
    ↓ clic "Ajouter au panier"
React (ShopPage.jsx)
    ↓ addToCart(productId) via CartContext
Axios (services/api.js)
    ↓ POST /api/v1/cart {product_id, quantity}
    ↓ Header: Authorization: Bearer <token>
    ↓ Header: Content-Type: application/json
Nginx (:8080)
    ↓ location ~ \.php$ → fastcgi_pass backend:9000
Laravel (routes/api.php)
    ↓ Route: POST /v1/cart → CartController@store
Middleware auth:sanctum
    ↓ vérifie le token Sanctum → identifie l'utilisateur
CartController::store(Request $request)
    ↓ validation: product_id required|exists, quantity integer|min:1
CartService::addItem($user, $productId, $qty)
    ↓ logique métier: vérifie le stock, crée/incrémente le cart_item
Cart Model + CartItem Model (Eloquent)
    ↓ INSERT/UPDATE dans MySQL
MySQL
    ↓ OK
JSON Response
    ↓ 200 { message: "Produit ajouté au panier.", data: {...} }
Axios intercepteur de réponse
    ↓ toast automatique "Produit ajouté au panier."
React (CartContext → refresh())
    ↓ rafraîchit le compteur du panier dans le header
```

### 1.4 Parcours complet d'une requête — Mobile

```
Téléphone (Expo Go)
    ↓ touche "Panier" sur ProductCard
React Native (ShopScreen.jsx)
    ↓ handleAddCart(productId) → addToCart() via CartContext
Axios (services/api.js)
    ↓ POST http://192.168.8.103:8080/api/v1/cart
    ↓ Token lu depuis AsyncStorage
    ↓
VirtualBox NAT (PC hôte :8080 → VM :8080)
    ↓
Docker Network
    ↓ ecommerce-nginx :80 → fastcgi_pass backend:9000
    ↓
Laravel → CartController → CartService → MySQL
    ↓
JSON Response → Axios → CartContext.refresh() → badge mis à jour
```

---

## 2. Audit du backend Laravel

### 2.1 Structure des dossiers

```
backend/
├── app/
│   ├── Console/Commands/          # Commandes artisan (1 fichier)
│   ├── Http/
│   │   ├── Controllers/Api/       # Controllers publics (8 fichiers)
│   │   │   └── Admin/             # Controllers admin (6 fichiers)
│   │   ├── Middleware/             # Middleware custom (1 fichier)
│   │   ├── Requests/Auth/         # Form Requests (2 fichiers)
│   │   └── Resources/             # API Resources (8 fichiers)
│   ├── Models/                    # Eloquent Models (10 fichiers)
│   ├── Notifications/             # Notifications (1 fichier)
│   ├── Providers/                 # Service Providers (2 fichiers)
│   ├── Repositories/
│   │   ├── Contracts/             # Interfaces (1 fichier)
│   │   └── Eloquent/              # Implémentations (1 fichier)
│   └── Services/                  # Services métier (3 + 4 AI)
├── config/                        # Configuration Laravel
├── database/
│   ├── factories/                 # Factories (3 fichiers)
│   ├── migrations/                # Migrations (15 fichiers)
│   └── seeders/                   # Seeders (1 fichier)
├── routes/api.php                 # Toutes les routes API
└── tests/Feature/                 # Tests PHPUnit (7 fichiers)
```

### 2.2 Models (10)

| Model | Table | Relations | Attributs spéciaux |
|-------|-------|-----------|-------------------|
| `User` | users | hasOne Cart, hasMany Orders/Reviews/Wishlists | `role` enum, `is_active`, `getImageUrlAttribute` |
| `Product` | products | belongsTo Category, hasMany Reviews | `price` decimal, `status` enum, scope `active()`, accessor `image_url` |
| `Category` | categories | hasMany Products | `slug` auto |
| `Cart` | carts | belongsTo User, hasMany CartItems | Un seul par user |
| `CartItem` | cart_items | belongsTo Cart + Product | `quantity` integer |
| `Order` | orders | belongsTo User, hasMany OrderItems + Payment | `status` enum (5 valeurs), `total_price` |
| `OrderItem` | order_items | belongsTo Order + Product | `price` = prix au moment de l'achat |
| `Wishlist` | wishlists | belongsTo User + Product | Unicité user+product |
| `Review` | reviews | belongsTo User + Product | `rating` 1-5, `image` optionnelle |
| `Coupon` | coupons | — | `type` percent/fixed, `expiration_date` |
| `Payment` | payments | belongsTo Order | `method`, `status` (simulé) |

### 2.3 Controllers publics (8)

| Controller | Routes | Rôle |
|-----------|--------|------|
| `AuthController` | POST register/login/logout, GET me | Inscription, connexion, déconnexion, profil |
| `PasswordResetController` | POST forgot/reset-password | Réinitialisation mot de passe |
| `ProductController` | GET products, GET products/{id} | Liste paginée + détail produit |
| `CategoryController` | GET categories | Liste des catégories |
| `CartController` | CRUD /cart | Panier (add, update qty, remove, list) |
| `WishlistController` | CRUD /wishlist | Favoris (add, remove, list) |
| `OrderController` | GET/POST /orders | Commandes (créer, lister, détail) |
| `ReviewController` | GET/POST /reviews | Avis produits |
| `ProfileController` | PUT /profile, PUT /profile/password | Mise à jour profil/mot de passe |
| `AiController` | /ai/* | Chatbot, recommandations, recherche image |

### 2.4 Controllers admin (6)

| Controller | Routes | Rôle |
|-----------|--------|------|
| `DashboardController` | GET /admin/dashboard | Statistiques (produits, users, CA, graphiques) |
| `AdminProductController` | CRUD /admin/products + POST image | CRUD produits + upload image + indexation CV auto |
| `AdminCategoryController` | CRUD /admin/categories | CRUD catégories |
| `AdminOrderController` | GET + PATCH status | Liste commandes + changement de statut |
| `AdminUserController` | GET + PATCH toggle | Liste utilisateurs + activer/désactiver |
| `AdminCouponController` | GET/POST/DELETE | Gestion coupons |

### 2.5 Services métier (7)

| Service | Rôle | Injecté dans |
|---------|------|-------------|
| `AuthService` | Validation login (email+password+actif), création token Sanctum | AuthController |
| `CartService` | Logique panier (créer cart, ajouter item, vérifier stock) | CartController |
| `OrderService` | Checkout complet (stock, coupon, order, payment, vider panier) | OrderController |
| `ChatbotService` | Chatbot local (FAQ) + OpenAI optionnel | AiController |
| `RecommendationService` | Recommandations par catégorie/historique | AiController |
| `ImageSearchService` | Recherche image stricte (0 ou 1 produit) via CV | AiController |
| `OpenAiClient` | Client OpenAI optionnel | ChatbotService |
| `VisionSearchClient` | Client HTTP vers cv-service Python | ImageSearchService, AdminProductController |

### 2.6 Repository Pattern

| Interface | Implémentation | Méthodes |
|-----------|---------------|----------|
| `ProductRepositoryInterface` | `ProductRepository` | `all()`, `find()`, `create()`, `update()`, `delete()` |

Lié via `RepositoryServiceProvider` (`$app->bind(Interface, Implementation)`).

### 2.7 Resources (8)

| Resource | Champs exposés |
|----------|---------------|
| `ProductResource` | id, name, slug, description, price, stock, image_url, status, category, average_rating, created_at |
| `CategoryResource` | id, name, slug, description, products_count |
| `OrderResource` | id, status, total_price, shipping_address, coupon_code, discount, items, payment, created_at |
| `OrderItemResource` | id, product, quantity, price |
| `ReviewResource` | id, user (name), rating, comment, image, created_at |
| `UserResource` | id, name, email, role, phone, is_active, created_at |
| `PaymentResource` | id, method, status, amount |

### 2.8 Middleware

| Middleware | Rôle | Appliqué sur |
|-----------|------|-------------|
| `auth:sanctum` (Laravel) | Vérifie le token Bearer | Routes protégées |
| `AdminMiddleware` | Vérifie `$user->role === 'admin'`, sinon 403 | Routes `/admin/*` |

### 2.9 Form Requests

| Request | Champ | Règles |
|---------|-------|--------|
| `RegisterRequest` | name | required, string, max:255 |
| | email | required, email, unique:users |
| | password | required, string, min:8, confirmed |
| `LoginRequest` | email | required, email |
| | password | required, string |

### 2.10 Routes API complètes

| Méthode | Route | Controller | Auth | Admin |
|---------|-------|-----------|------|-------|
| POST | /register | AuthController@register | — | — |
| POST | /login | AuthController@login | — | — |
| POST | /forgot-password | PasswordResetController@forgot | — | — |
| POST | /reset-password | PasswordResetController@reset | — | — |
| GET | /products | ProductController@index | — | — |
| GET | /products/{id} | ProductController@show | — | — |
| GET | /categories | CategoryController@index | — | — |
| GET | /ai/status | AiController@status | — | — |
| POST | /ai/chat | AiController@chat | — | — |
| POST | /ai/search-image | AiController@searchImage | — | — |
| GET | /ai/recommendations | AiController@recommendations | — | — |
| GET | /products/{id}/recommendations | AiController@productRecommendations | — | — |
| GET | /products/{id}/reviews | ReviewController@index | — | — |
| POST | /logout | AuthController@logout | Sanctum | — |
| GET | /me | AuthController@me | Sanctum | — |
| PUT | /profile | ProfileController@update | Sanctum | — |
| PUT | /profile/password | ProfileController@updatePassword | Sanctum | — |
| POST | /products/{id}/reviews | ReviewController@store | Sanctum | — |
| GET/POST/PUT/DELETE | /cart | CartController | Sanctum | — |
| GET/POST/DELETE | /wishlist | WishlistController | Sanctum | — |
| GET/POST | /orders | OrderController | Sanctum | — |
| GET | /orders/{id} | OrderController@show | Sanctum | — |
| GET | /admin/dashboard | DashboardController@stats | Sanctum | Admin |
| CRUD | /admin/products | AdminProductController | Sanctum | Admin |
| POST | /admin/products/{id}/image | AdminProductController@uploadImage | Sanctum | Admin |
| CRUD | /admin/categories | AdminCategoryController | Sanctum | Admin |
| GET/PATCH | /admin/orders | AdminOrderController | Sanctum | Admin |
| GET/PATCH | /admin/users | AdminUserController | Sanctum | Admin |
| GET/POST/DELETE | /admin/coupons | AdminCouponController | Sanctum | Admin |

### 2.11 Authentification Sanctum

1. `POST /login` → `AuthService` vérifie email+password+is_active → crée un token Sanctum
2. Réponse : `{ user: {...}, token: "1|abc..." }`
3. Le client stocke le token (`localStorage` web, `AsyncStorage` mobile)
4. Chaque requête protégée envoie : `Authorization: Bearer 1|abc...`
5. Middleware `auth:sanctum` vérifie le token dans `personal_access_tokens`
6. `POST /logout` → `$user->currentAccessToken()->delete()`

### 2.12 Codes HTTP utilisés

| Code | Signification | Exemples |
|------|--------------|----------|
| 200 | Succès | GET, PUT, DELETE |
| 201 | Créé | POST register, POST order, POST review |
| 401 | Non authentifié | Token absent ou invalide |
| 403 | Interdit | User accède à /admin |
| 404 | Non trouvé | Produit inexistant |
| 422 | Validation échouée | Champs invalides, stock insuffisant |
| 503 | Service indisponible | cv-service down |

---

## 3. Analyse de la base de données

### 3.1 Schéma relationnel

```
┌─────────────┐
│   users     │
│  (id, name, │
│  email,     │
│  role,      │
│  is_active) │
└──────┬──────┘
       │ 1
       │
       ├──────── 1:1 ────── carts ── 1:N ── cart_items ── N:1 ──┐
       │                                                         │
       ├──────── 1:N ────── wishlists ── N:1 ───────────────────┤
       │                                                         │
       ├──────── 1:N ────── orders ── 1:N ── order_items ── N:1 ┤
       │                     │                                   │
       │                     └── 1:1 ── payments                 │
       │                                                         │
       ├──────── 1:N ────── reviews ── N:1 ─────────────────────┤
       │                                                         ▼
       │                                                  ┌──────────┐
       │                                                  │ products │
       │                                                  └────┬─────┘
       │                                                       │ N:1
       │                                                  ┌────┴──────┐
       │                                                  │categories │
       └──────────────────────────────────────────────────└───────────┘
                                                          
                                                          coupons (indépendant)
```

### 3.2 Tables détaillées (15 migrations)

#### `users`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | NOT NULL, UNIQUE |
| password | varchar(255) | NOT NULL (bcrypt) |
| phone | varchar(255) | NULLABLE |
| role | enum('user','admin') | DEFAULT 'user' |
| is_active | boolean | DEFAULT true |
| email_verified_at | timestamp | NULLABLE |
| remember_token | varchar(100) | NULLABLE |
| timestamps | created_at, updated_at | |

#### `categories`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigint unsigned | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| description | text | NULLABLE |
| timestamps | | |

#### `products`

| Colonne | Type | Contraintes |
|---------|------|-------------|
| id | bigint unsigned | PK |
| category_id | bigint unsigned | FK → categories.id (CASCADE) |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | NOT NULL, UNIQUE |
| description | text | NULLABLE |
| price | decimal(10,2) | NOT NULL |
| stock | integer | DEFAULT 0 |
| image | varchar(255) | NULLABLE |
| status | enum('active','inactive') | DEFAULT 'active' |
| timestamps | | |

#### `carts` / `cart_items`

| Table | Colonne | FK |
|-------|---------|-----|
| carts | user_id | → users.id (CASCADE) |
| cart_items | cart_id | → carts.id (CASCADE) |
| cart_items | product_id | → products.id (CASCADE) |
| cart_items | quantity | integer, DEFAULT 1 |

#### `orders` / `order_items`

| Table | Colonne | Type / FK |
|-------|---------|-----------|
| orders | user_id | → users.id (CASCADE) |
| orders | total_price | decimal(10,2) |
| orders | status | enum: pending, processing, shipped, delivered, cancelled |
| orders | shipping_address | text |
| orders | coupon_code | varchar, NULLABLE |
| orders | discount | decimal(10,2), DEFAULT 0 |
| order_items | order_id | → orders.id (CASCADE) |
| order_items | product_id | → products.id (CASCADE) |
| order_items | quantity | integer |
| order_items | price | decimal(10,2) — prix figé à l'achat |

#### `payments`

| Colonne | Type |
|---------|------|
| order_id | FK → orders.id (CASCADE) |
| method | varchar (card, paypal, cash) |
| status | varchar (completed, pending, failed) |
| amount | decimal(10,2) |

#### `reviews`

| Colonne | Type |
|---------|------|
| user_id | FK → users.id (CASCADE) |
| product_id | FK → products.id (CASCADE) |
| rating | tinyint (1-5) |
| comment | text, NULLABLE |
| image | varchar, NULLABLE |

#### `coupons`

| Colonne | Type |
|---------|------|
| code | varchar, UNIQUE |
| discount | decimal(10,2) |
| type | enum('percent','fixed') |
| expiration_date | date, NULLABLE |

#### `wishlists`

| Colonne | Type |
|---------|------|
| user_id | FK → users.id (CASCADE) |
| product_id | FK → products.id (CASCADE) |
| UNIQUE(user_id, product_id) | |

### 3.3 Seeders

`DatabaseSeeder` : crée 2 comptes (admin + client), 3 catégories (Électronique, Mode, Maison), 6 produits avec images picsum, 1 coupon WELCOME10 (10%, expire dans 1 an).

---

## 4. Analyse du frontend React

### 4.1 Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 19.0.0 | Framework UI |
| React Router | 7.1.1 | Routing SPA |
| Axios | 1.7.9 | Client HTTP |
| Tailwind CSS | 4.0.0 | Framework CSS |
| Vite | 6.0.7 | Bundler |
| Chart.js | 4.5.1 | Graphiques admin |
| Vitest | 3.0.5 | Tests unitaires |
| Cypress | 14.0.0 | Tests E2E |

### 4.2 Architecture

```
src/
├── main.jsx           # Point d'entrée React
├── App.jsx            # Routing + Providers
├── index.css          # Tailwind + palette Vivid
├── contexts/          # 3 contextes (Auth, Cart, Toast)
├── services/          # Axios instance + services métier
├── layouts/           # MainLayout + AdminLayout
├── components/        # 14 composants réutilisables
├── pages/             # 10 pages publiques + 6 admin
└── utils/             # 3 utilitaires
```

### 4.3 Contextes

| Contexte | État | Hook | Rôle |
|----------|------|------|------|
| `AuthContext` | user, loading | `useAuth()` | Login/register/logout, token localStorage, refresh profil |
| `CartContext` | cart, loading | `useCart()` | Panier synchronisé avec l'API, compteur d'items |
| `ToastContext` | toasts[] | `useToast()` | Notifications globales, connecté au bus Axios |

### 4.4 Routing

| Route | Page | Protection |
|-------|------|-----------|
| `/` | HomePage | Publique |
| `/shop` | ShopPage | Publique |
| `/products/:id` | ProductDetailPage | Publique |
| `/login`, `/register` | Auth pages | Publique |
| `/cart`, `/wishlist`, `/checkout` | Client pages | `ProtectedRoute` (auth) |
| `/orders`, `/orders/:id`, `/profile` | Client pages | `ProtectedRoute` (auth) |
| `/admin/*` | Admin pages (6) | `ProtectedRoute adminOnly` |

### 4.5 Parcours utilisateur

**Connexion** : LoginPage → `login({email, password})` → AuthContext stocke token dans localStorage → redirige vers `/shop`

**Consultation produits** : ShopPage → `productService.list({search, category_id, sort, page})` → FlatList avec ProductCard

**Ajout au panier** : ProductCard → `addToCart(productId)` → CartContext → `cartService.add()` → refresh → badge mis à jour

**Passage de commande** : CartPage → CheckoutPage → `orderService.create({address, payment, coupon})` → OrdersPage

### 4.6 Fonctionnalités IA (web)

| Fonctionnalité | Composant | Endpoint |
|----------------|-----------|----------|
| Chatbot | `Chatbot.jsx` (flottant) | POST /ai/chat |
| Recommandations | HomePage, ProductDetailPage | GET /ai/recommendations |
| Recherche photo | `ImageSearch.jsx` | POST /ai/search-image |

---

## 5. Analyse de l'application mobile React Native

### 5.1 Stack technique

| Technologie | Version | Rôle |
|-------------|---------|------|
| React Native | 0.81.5 | Framework mobile |
| Expo SDK | 54 | Plateforme de développement |
| React Navigation | 7.x | Navigation (Stack + Tabs) |
| Axios | 1.7.9 | Client HTTP |
| AsyncStorage | 2.2.0 | Stockage local (token) |
| expo-image-picker | 17.0.11 | Accès galerie/caméra |
| expo-file-system | 19.0.23 | Upload multipart fiable |

### 5.2 Architecture

```
mobile/
├── App.js                    # Providers (Auth > Cart > Wishlist)
├── src/
│   ├── config/api.js         # URL API dynamique + PINK
│   ├── contexts/             # 3 contextes (Auth, Cart, Wishlist)
│   ├── services/             # Axios + services métier
│   ├── navigation/           # Stack + Bottom Tabs
│   ├── screens/              # 13 écrans
│   ├── components/           # 5 composants
│   └── utils/                # 4 utilitaires
├── start.sh                  # Lancement Docker + Expo LAN
└── app.json                  # Config Expo
```

### 5.3 Navigation

```
NavigationContainer
└── Stack.Navigator
    ├── MainTabs (Tab.Navigator)
    │   ├── Accueil (HomeScreen)
    │   ├── Boutique (ShopScreen)
    │   ├── Favoris (WishlistScreen)
    │   ├── Panier (CartScreen) — avec badge compteur
    │   └── Profil (ProfileScreen)
    ├── ProductDetail, Checkout, Orders, OrderDetail
    ├── Login, Register, ForgotPassword, ResetPassword
```

### 5.4 Gestion du token

| Opération | Méthode |
|-----------|---------|
| Stockage | `AsyncStorage.setItem('token', data.token)` |
| Lecture | `AsyncStorage.getItem('token')` (intercepteur Axios) |
| Suppression | `AsyncStorage.removeItem('token')` (logout ou token invalide) |

### 5.5 Upload multipart (Android/iOS)

React Native a des problèmes connus avec l'upload de fichiers via FormData/Axios. Solution :

1. `prepareUploadFile(asset)` : copie le fichier depuis `content://` (Android) vers le cache Expo (`file://`)
2. `postMultipart()` : utilise `FileSystem.uploadAsync()` d'Expo pour un upload natif fiable

### 5.6 Résolution d'URLs d'images

`resolveMediaUrl()` remplace `localhost` et `127.0.0.1` dans les URLs d'images par l'IP réelle du PC (passée via `API_HOST_IP`), car le téléphone ne peut pas accéder à `localhost` de la VM.

---

## 6. Analyse Docker

### 6.1 Services (docker-compose.yml)

| Service | Image | Port hôte | Rôle |
|---------|-------|-----------|------|
| `backend` | Build `./docker/php` (PHP 8.3-fpm) | — (interne :9000) | API Laravel |
| `nginx` | nginx:alpine | 8080 → 80 | Reverse proxy |
| `frontend` | Build `./docker/node` (Node 22) | 5173 → 5173 | React SPA |
| `mysql` | mysql:8.0 | 3307 → 3306 | Base de données |
| `phpmyadmin` | phpmyadmin:5.2 | 8082 → 80 | Admin BDD |
| `cv-service` | Build `./cv-service` (Python 3.11) | 8090 → 8090 | Computer Vision |

### 6.2 Chaîne de dépendances

```
mysql (healthy) ──┐
                  ├── backend ── nginx ── frontend
cv-service (healthy) ┘

mysql (healthy) ── phpmyadmin
```

### 6.3 Volumes

| Volume | Type | Service | Contenu |
|--------|------|---------|---------|
| `mysql_data` | Nommé | mysql | Données MySQL persistantes |
| `cv_index_data` | Nommé | cv-service | Index embeddings (index.pkl) |
| `./backend:/var/www/html` | Bind | backend + nginx | Code Laravel |
| `./frontend:/app` | Bind | frontend | Code React |
| `/app/node_modules` | Anonyme | frontend | Isole node_modules |

### 6.4 Healthchecks

| Service | Test | Intervalle | Timeout |
|---------|------|-----------|---------|
| `mysql` | `mysqladmin ping` | 10s | 10s, 30 retries, start 60s |
| `cv-service` | `urllib.request.urlopen(health)` | 15s | 5s, 5 retries, start 20s |

### 6.5 Dockerfiles

**PHP (backend)** : PHP 8.3-fpm, extensions pdo_mysql + zip + gd, Composer 2, uploads.ini (10M max).

**Node (frontend)** : Node 22-alpine, Vite dev server sur `0.0.0.0:5173`.

**CV service** : Python 3.11-slim, OpenCV headless, FastAPI + Uvicorn sur :8090.

### 6.6 Nginx

```
server {
    listen 80;
    root /var/www/html/public;
    client_max_body_size 20M;
    
    location /     → try_files $uri $uri/ /index.php (front controller Laravel)
    location \.php → fastcgi_pass backend:9000 (PHP-FPM)
}
```

---

## 7. Analyse réseau

### 7.1 Schéma réseau complet

```
┌─────────────────────────────────────────────────────────┐
│  Téléphone (WiFi : 192.168.8.x)                        │
│  └── Expo Go                                            │
│       └── App React Native                              │
│            API URL: http://192.168.8.103:8080/api/v1    │
│            Metro:   exp://192.168.8.103:8081            │
└────────────────────────┬────────────────────────────────┘
                         │ WiFi (même réseau)
                         ▼
┌─────────────────────────────────────────────────────────┐
│  PC Hôte Windows (192.168.8.103)                        │
│                                                          │
│  VirtualBox NAT + Port Forwarding :                      │
│    8080 → 10.0.2.15:8080  (API)                         │
│    8081 → 10.0.2.15:8081  (Metro bundler)               │
│   19000 → 10.0.2.15:19000 (Expo dev server)             │
└────────────────────────┬────────────────────────────────┘
                         │ NAT
                         ▼
┌─────────────────────────────────────────────────────────┐
│  VM Linux (10.0.2.15)                                    │
│                                                          │
│  Docker Network (172.x.x.x) :                           │
│    ┌──────────────┐  ┌──────────┐  ┌──────────┐        │
│    │ nginx:80     │  │mysql:3306│  │cv:8090   │        │
│    │ (8080 ext)   │  │(3307 ext)│  │(8090 ext)│        │
│    └──────┬───────┘  └──────────┘  └──────────┘        │
│           │ fastcgi                                      │
│    ┌──────┴───────┐                                      │
│    │ backend:9000 │ (PHP-FPM, pas de port ext)          │
│    └──────────────┘                                      │
│                                                          │
│  Expo Docker (8081 ext) :                               │
│    ┌──────────────┐                                      │
│    │ Metro :8081  │ (conteneur éphémère node:22-alpine) │
│    └──────────────┘                                      │
└─────────────────────────────────────────────────────────┘
```

### 7.2 Pourquoi ces ports ?

| Port | Service | Pourquoi |
|------|---------|----------|
| **8080** | API Laravel (via Nginx) | Le téléphone appelle l'API pour les produits, auth, panier, etc. |
| **8081** | Metro Bundler | Le téléphone télécharge le bundle JavaScript de l'app React Native |
| **19000** | Serveur Expo | Connexion initiale d'Expo Go, QR code, dev tools |

### 7.3 Pourquoi le téléphone ne peut pas accéder directement à la VM ?

La VM VirtualBox utilise le **mode NAT** : elle a une IP privée `10.0.2.15` qui n'est accessible que depuis l'hôte, via une traduction d'adresses. Le téléphone, sur le WiFi, ne voit que l'IP du **PC hôte** (`192.168.8.103`). Sans redirection de ports, les paquets s'arrêtent au PC hôte.

### 7.4 Les 4 réseaux

| Réseau | IP | Qui le voit ? |
|--------|-----|-------------|
| `localhost` / `127.0.0.1` | Loopback | Seulement la machine elle-même |
| `10.0.2.x` | VirtualBox NAT | VM ↔ hôte uniquement |
| `172.x.x.x` | Docker bridge | Conteneurs entre eux uniquement |
| `192.168.x.x` | WiFi LAN | Tous les appareils du même WiFi |

### 7.5 Parcours d'une requête : téléphone → API

```
1. Expo Go envoie GET http://192.168.8.103:8080/api/v1/products
2. Le paquet arrive sur le PC hôte (192.168.8.103), port 8080
3. VirtualBox redirige vers la VM (10.0.2.15:8080)
4. Docker redirige vers le conteneur nginx (172.x.x.x:80)
5. Nginx route vers PHP-FPM (backend:9000)
6. Laravel traite la requête → MySQL → JSON
7. Réponse remonte : backend → nginx → Docker → VM → VirtualBox → WiFi → téléphone
```

### 7.6 Variable REACT_NATIVE_PACKAGER_HOSTNAME

Sans cette variable, Metro annonce son IP Docker interne (`172.17.0.2`) dans le QR code. Le téléphone ne peut pas y accéder. En définissant `REACT_NATIVE_PACKAGER_HOSTNAME=192.168.8.103`, le QR code pointe vers l'IP du PC hôte.

---

## 8. Analyse de la qualité du code

### 8.1 Points positifs

| Aspect | Détail |
|--------|--------|
| **Séparation des responsabilités** | Controller → Service → Repository → Model |
| **Repository Pattern** | Interface + implémentation, injection de dépendances |
| **API Resources** | Formatage JSON cohérent, pas d'exposition directe des modèles |
| **Validation** | Form Requests pour auth + métier (Cart, Order, Review, Profile, Admin) |
| **Tests** | PHPUnit (Feature) + Vitest + Cypress E2E local |
| **CI/CD** | GitHub Actions (2 jobs : PHPUnit, Vitest) — E2E Cypress en local |
| **Docker** | Healthchecks, volumes nommés, chaîne de dépendances |
| **Messages FR** | Toutes les réponses API et UI en français |
| **Microservice CV** | Séparation propre, API REST, stockage indépendant |

### 8.2 Points corrigés

Tous les points d'amélioration identifiés lors de l'audit initial ont été corrigés :

| # | Problème initial | Correction appliquée |
|---|-----------------|---------------------|
| 1 | **Promotions fictives** `(id + index) % 3` côté client | Migration `add_original_price_to_products`, champ `original_price` dans Model/Resource/Seeder. `getPromo()` utilise désormais le champ backend. |
| 2 | **Repository Pattern partiel** (seul Product) | Ajout `OrderRepository` + `CategoryRepository` (interfaces + implémentations + binding dans ServiceProvider). |
| 3 | **Pas de Form Request** pour Cart, Order, Review, Profile, Admin | 11 Form Requests créés : `StoreCartRequest`, `UpdateCartRequest`, `StoreOrderRequest`, `StoreReviewRequest`, `UpdateProfileRequest`, `UpdatePasswordRequest`, `StoreProductRequest`, `UpdateProductRequest`, `StoreCategoryRequest`, `StoreCouponRequest`, `UpdateOrderStatusRequest`. |
| 4 | **Pas de rate limiting** | `throttle:10,1` sur routes auth (login, register, forgot/reset-password). `throttle:20,1` sur routes IA (chat, search-image). |
| 5 | **Token Sanctum sans expiration** | Publication de `config/sanctum.php`, expiration configurée à 24h (`60 * 24` minutes). |
| 6 | **Pas de pagination admin** | `AdminOrdersPage` et `AdminUsersPage` utilisent désormais `Pagination` + `meta`. Backend renvoie `meta` avec `current_page`, `last_page`, `total`. |
| 7 | **Pas de Lazy Loading React** | Toutes les pages chargées via `React.lazy()` + `Suspense` avec spinner animé. |
| 8 | **Pas d'Error Boundary** | Composant `ErrorBoundary` créé, enveloppe toute l'app dans `App.jsx`. |
| 9 | **Pas de .dockerignore** | `.dockerignore` ajouté pour `backend/`, `frontend/`, `cv-service/`. |

### 8.3 Points restants (hors périmètre PFE / non bloquants)

| # | Point | Gravité | Raison |
|---|-------|---------|--------|
| 1 | **Paiement simulé** | Hors PFE | Accepté pour la soutenance |
| 2 | **HTTPS non configuré** | Attendu | Environnement de développement local |
| 3 | **Multi-stage Docker builds** | Faible | Images de dev, non optimisées pour la production |
| 4 | **Cypress hors CI** | Faible | Job E2E Docker trop lourd sur GitHub Actions ; scénario conservé en local |

### 8.4 Fichiers inutilisés

| Fichier | Raison |
|---------|--------|
| `backend/app/Services/Ai/OpenAiClient.php` | Optionnel (pas de clé API configurée) — conservé pour extension future |

### 8.5 Dépendances inutilisées

Aucune dépendance réellement inutilisée détectée.

---

## 9. Vérification des bonnes pratiques

### 9.1 Laravel

| Pratique | Respectée ? | Détail |
|----------|-------------|--------|
| MVC | Oui | Controllers → Services → Models |
| Repository Pattern | Oui | Product, Order, Category (3 interfaces + implémentations) |
| API Resources | Oui | 8 resources pour le formatage JSON |
| Form Requests | Oui | 13 au total (2 auth + 11 métier) |
| Eloquent Scopes | Oui | `Product::active()` |
| Accessors | Oui | `getImageUrlAttribute()` |
| Service Injection | Oui | Via constructeur (DI) |
| Migrations | Oui | 15 migrations versionnées |
| Seeders + Factories | Oui | 3 factories, 1 seeder |
| Tests | Oui | 33 tests PHPUnit, 7 fichiers |

### 9.2 React

| Pratique | Respectée ? |
|----------|-------------|
| Composants fonctionnels + hooks | Oui |
| Context API pour l'état global | Oui (3 contextes) |
| Séparation pages/composants | Oui |
| Services centralisés (Axios) | Oui |
| Protected Routes | Oui (auth + admin) |
| Lazy loading | Oui (React.lazy + Suspense pour toutes les pages) |
| Error Boundaries | Oui (ErrorBoundary enveloppe App) |

### 9.3 React Native

| Pratique | Respectée ? |
|----------|-------------|
| Navigation React Navigation 7 | Oui (Stack + Tabs) |
| AsyncStorage pour le token | Oui |
| Contextes partagés avec le web | Oui (même logique) |
| Upload natif fiable | Oui (expo-file-system) |
| Résolution d'URLs media | Oui (resolveMediaUrl) |

### 9.4 Docker

| Pratique | Respectée ? |
|----------|-------------|
| Un service par conteneur | Oui |
| Healthchecks | Oui (MySQL, cv-service) |
| Volumes nommés | Oui (mysql_data, cv_index_data) |
| .dockerignore | Oui (backend, frontend, cv-service) |
| Multi-stage builds | Non (images de dev) |
| Images slim | Oui (alpine, slim-bookworm) |

### 9.5 REST API

| Pratique | Respectée ? |
|----------|-------------|
| Versionnement (/v1/) | Oui |
| Nommage des ressources (pluriel) | Oui |
| Codes HTTP appropriés | Oui |
| JSON cohérent (data, meta, message) | Oui |
| Bearer token auth | Oui |
| CORS | Oui |

### 9.6 Sécurité

| Aspect | État |
|--------|------|
| Mots de passe hashés (bcrypt) | OK |
| Tokens Sanctum | OK |
| Middleware auth + admin | OK |
| Validation des entrées | OK |
| CORS configuré | OK |
| SQL Injection | Protégé (Eloquent) |
| XSS | React échappe par défaut |
| Rate limiting | Oui (throttle:10,1 auth, throttle:20,1 IA) |
| HTTPS | Non (dev local) |

---

## 10. Documentation finale de soutenance

### 10.1 Résumé du projet

**Vivid** est une plateforme e-commerce full-stack avec :
- **Backend** : API REST Laravel 12 (PHP 8.3) avec authentification Sanctum, Repository Pattern, tests PHPUnit
- **Frontend web** : SPA React 19 avec Tailwind CSS 4, dashboard admin, Vitest + Cypress E2E local
- **App mobile** : React Native via Expo, navigation Stack+Tabs, bouton WhatsApp
- **Microservice CV** : Python 3.11, FastAPI, MobileNetV2 ONNX (embeddings) pour la recherche par image
- **Contact** : WhatsApp flottant (web + mobile) à la place d’un chatbot UI
- **Infrastructure** : Docker Compose (6 services), CI/CD GitHub Actions (PHPUnit + Vitest)

### 10.2 Choix techniques et justifications

| Choix | Justification |
|-------|---------------|
| **Laravel** | Framework PHP mature, Eloquent ORM, Sanctum pour les SPA, écosystème riche |
| **React** | Composants fonctionnels, hooks, large communauté, Vite pour le HMR rapide |
| **React Native + Expo** | Code partagé avec le web (services, logique), Expo Go pour le développement rapide |
| **MobileNetV2 ONNX** (pas cloud) | Embeddings locaux, photos réelles, pas d’API vision payante, adapté au PFE |
| **Microservice CV** (pas dans Laravel) | Python + ONNX plus naturel qu’en PHP, séparation des responsabilités |
| **WhatsApp** (contact client) | Canal réel pour le client, simple à démontrer en soutenance |
| **Docker Compose** | Environnement reproductible, pas de "ça marche sur ma machine" |
| **Repository Pattern** | Abstraction de l'accès aux données, testabilité, respect SOLID |
| **Sanctum** (pas JWT) | Conçu pour les SPA, intégré à Laravel, plus simple que Passport |

### 10.3 Avantages de l'architecture

1. **Séparation claire** : Backend API-only → consommable par web ET mobile
2. **Microservice CV** : Technologie indépendante (Python), scalable séparément
3. **Code partagé** : Les services API sont quasi-identiques entre web et mobile
4. **Testabilité** : PHPUnit + Vitest en CI, Cypress E2E en local
5. **Dockerisé** : `setup.sh` / `docker compose` démarre la stack
6. **Contact client** : WhatsApp intégré web + mobile

### 10.4 Couverture de tests

| Couche | Framework | Contenu | CI |
|--------|-----------|---------|-----|
| Backend | PHPUnit | Auth, Cart, Checkout, Wishlist, Admin, Health, AI | Oui |
| Frontend unitaire | Vitest | LoginPage, ProductCard, ProtectedRoute | Oui |
| Frontend E2E | Cypress | 1 parcours checkout | Local uniquement |
| CI/CD | GitHub Actions | 2 jobs | PHPUnit → Vitest |

### 10.5 Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Admin | `admin@shop.com` | `password` |
| Client | `client@shop.com` | `password` |

### 10.6 Commandes de démarrage

```bash
# Installation complète (première fois)
chmod +x setup.sh && ./setup.sh

# Démarrage rapide
docker compose up -d

# Mobile
cd mobile && API_HOST_IP=192.168.8.103 ./start.sh

# Tests
docker compose exec backend php artisan test
cd frontend && npm test

# Index CV
docker compose exec backend php artisan products:index-visuals --fresh
```

### 10.7 URLs des services

| URL | Service |
|-----|---------|
| http://localhost:5173 | Boutique React |
| http://localhost:8080/api/v1 | API REST Laravel |
| http://localhost:8082 | PhpMyAdmin |
| http://localhost:8090/health | CV Service |

### 10.8 Phases du projet

| Phase | Contenu | Statut |
|-------|---------|--------|
| 1 | Backend Laravel, API REST, Git, PHPUnit, Postman | Terminé |
| 2 | Vitest, Cypress E2E (local), GitHub Actions CI | Terminé |
| 3 | App mobile React Native (Expo) | Terminé |
| 4 | Computer Vision (MobileNetV2 ONNX), WhatsApp, recommandations | Terminé |

> **Verdict PFE :** projet **terminé** pour la soutenance. Paiement réel hors périmètre.

