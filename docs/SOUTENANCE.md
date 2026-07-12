# Fiche soutenance — Phase 1

## Pitch (30 secondes)

Plateforme e-commerce **Vivid** : API REST Laravel 12 + frontend React 19, conteneurisée avec Docker. Fonctionnalités complètes (auth, catalogue, panier, commandes, favoris, avis, admin). **26 tests PHPUnit** + **tests Postman automatisés**.

## Stack

- Backend : Laravel 12, Sanctum, Repository Pattern
- Frontend : React 19, Vite, Tailwind CSS 4
- Mobile : React Native (Expo) — `mobile/`
- BDD : MySQL 8
- Outils : Docker, Git/GitHub, Postman, PHPUnit

## Démonstration recommandée

1. `docker compose up -d --no-build` — démarrer le projet
2. http://localhost:5173 — boutique (login client)
3. Parcours : produit → panier → checkout
4. http://localhost:5173/admin — dashboard admin
5. http://localhost:8082 — PhpMyAdmin (tables)
6. Parcours mobile : `cd mobile && npx expo start`

## Comptes démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@shop.com | password |
| Client | client@shop.com | password |

## Points forts à mentionner

- Architecture en couches (Controller → Service → Repository)
- API REST versionnée (`/api/v1`)
- Auth par token Bearer (Sanctum)
- Tests automatisés (PHPUnit + Postman/Newman)
- Docker pour reproductibilité
- Messages d'erreur en français

## Diagrammes

Générer les PNG depuis PlantUML (extension VS Code/Cursor ou https://plantuml.com) :

- `docs/plantuml/use-case.puml` — cas d'utilisation
- `docs/plantuml/sequence-checkout.puml` — séquence checkout
- `docs/plantuml/classes-backend.puml` — classes backend

## Questions fréquentes

**Pourquoi Repository Pattern ?**  
Sépare l'accès aux données de la logique métier — plus testable et maintenable.

**Le paiement est-il réel ?**  
Non, simulé dans `OrderService` (statut `completed`, `transaction_id` généré). Stripe prévu en phase ultérieure.

**Mobile / IA ?**  
Mobile React Native (Expo) terminé. Phase 4 : **computer vision Python (OpenCV ORB)** pour recherche par photo stricte, chatbot, recommandations.

## Phase 4 — Démo IA

1. Web : bouton robot → chatbot
2. Boutique → **« Même produit (photo) »** — OpenCV ORB (Python), 0 ou 1 résultat
3. Index CV : `docker compose exec backend php artisan products:index-visuals --fresh`
4. Accueil / fiche produit → recommandations
5. Mobile : Assistant IA + 📷 en boutique

## Liens documentation

- [Architecture](ARCHITECTURE.md)
- [Base de données](BASE_DE_DONNEES.md)
- [Audit complet](AUDIT_COMPLET.md)
