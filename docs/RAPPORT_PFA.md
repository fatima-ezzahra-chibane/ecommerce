# Rapport de stage — Projet de Fin d’Année (PFA)

**Développement d’une plateforme e-commerce intelligente multi-supports**  
*(Web, mobile et service de vision par ordinateur)*

**Réalisé par :** Fatima Ezzahra CHIBANE  
**Organisme d’accueil :** Tasmim Web — Casablanca  
**Période :** du 22 juin 2026 au 22 juillet 2026

---

## Table des matières

1. Page de garde  
2. Remerciements  
3. Résumé  
4. Introduction générale  
5. Liste des abréviations  

**Chapitre 1** — Présentation de l’entreprise  
**Chapitre 2** — Contexte du stage  
**Chapitre 3** — Analyse des besoins  
**Chapitre 4** — Conception  
**Chapitre 5** — Réalisation  
**Chapitre 6** — Tests et validation  
**Chapitre 7** — Bilan  

Conclusion générale  
Bibliographie  
Webographie  
Annexes  

---

# 1. Page de garde

| | |
|---|---|
| **Établissement** | SUPMTI — École Supérieure de Management et de Télécommunication |
| **Ville de l’école** | Rabat |
| **Filière** | ISI — Ingénierie des Systèmes d’Information |
| **Année universitaire** | 2025 – 2026 |
| **Type de document** | Rapport de stage — Projet de Fin d’Année (PFA) |
| **Titre du projet** | Conception et réalisation d’une plateforme e-commerce intelligente (Vivid) |
| **Organisme d’accueil** | Tasmim Web (agence web e-marketing) |
| **Siège de l’agence** | Sidi Bernoussi — Casablanca |
| **Domaine** | Développement web, e-marketing et solutions numériques |
| **Réalisé par** | Fatima Ezzahra CHIBANE |
| **Encadrant professionnel** | Hamza Mohammed |
| **Période de stage** | Du 22 juin 2026 au 22 juillet 2026 |
| **Modalité** | Stage hybride |
| **Lieu du stage** | Casablanca (présentiel) / travail à distance selon planning hybride |

*[Insérer ici le logo de la SUPMTI — à gauche]*  
*[Insérer ici le logo de Tasmim Web — à droite]*

---

# 2. Remerciements

Avant d’aborder le détail technique de ce travail, je souhaite exprimer ma gratitude envers toutes les personnes qui ont accompagné mon parcours durant ce stage de fin d’année.

Je remercie en premier lieu **Hamza Mohammed** et l’équipe de **Tasmim Web** pour m’avoir accueillie au sein de l’agence, pour la confiance accordée et pour l’opportunité de réaliser un projet d’envergure dans un contexte professionnel réel.

Je remercie également l’ensemble du personnel de Tasmim Web pour leur disponibilité et pour les échanges qui m’ont permis de mieux comprendre les métiers du web, du branding et du e-marketing au Maroc.

Enfin, je remercie ma famille et mes proches pour leur soutien constant tout au long de cette période exigeante, au cours de laquelle j’ai mené le projet de manière autonome, de l’analyse à la livraison.

---

# 3. Résumé

Ce rapport présente le travail réalisé dans le cadre d’un **Projet de Fin d’Année (PFA)** effectué du **22 juin au 22 juillet 2026** au sein de **Tasmim Web**, agence web e-marketing basée à **Casablanca**. Le stage, conduit en mode **hybride**, a consisté à concevoir et développer **Vivid**, une plateforme e-commerce accessible sur le **web** et sur **mobile**, adossée à une **API REST** et enrichie de fonctionnalités avancées : **recherche de produits par image**, **recommandations**, et **contact client via WhatsApp**.

Sur le plan technique, l’architecture sépare clairement les responsabilités : un backend **Laravel** expose les services métier ; une application **React** assure l’interface boutique et l’administration ; une application **React Native (Expo)** cible les usages mobiles ; un microservice **Python (FastAPI)** réalise la similarité visuelle à l’aide d’embeddings **MobileNetV2 (ONNX)**. L’ensemble est orchestré avec **Docker Compose**, versionné sous **Git**, et contrôlé par une chaîne d’intégration continue (**PHPUnit**, **Vitest**).

Le projet a été réalisé en autonomie. Les objectifs du stage ont été atteints dans le périmètre défini : parcours client complet, espace administrateur, conteneurisation, tests automatisés et documentation. Le paiement a été volontairement **simulé**, choix cohérent avec la durée du stage (un mois) et le cadre pédagogique.

**Mots-clés :** e-commerce, API REST, Laravel, React, React Native, computer vision, Docker, Tasmim Web, PFA, SUPMTI.

---

# 4. Introduction générale

Dans un contexte où le commerce électronique occupe une place croissante dans l’économie numérique marocaine, les entreprises sollicitent de plus en plus des solutions digitales capables de combiner **visibilité**, **vente en ligne** et **expérience utilisateur**. Les agences web, telles que **Tasmim Web**, interviennent précisément dans ce domaine : branding, e-marketing, conception de sites, boutiques e-commerce et applications mobiles.

C’est dans cette optique que s’inscrit le présent **Projet de Fin d’Année (PFA)**, réalisé du **22 juin au 22 juillet 2026** au sein de **Tasmim Web** (Casablanca), en modalité **hybride**. Le projet, intitulé **Vivid**, vise la conception et le développement d’une **plateforme e-commerce intelligente multi-supports**, accessible à la fois sur le **web** et sur **mobile**. Au-delà des fonctionnalités classiques d’une boutique en ligne — authentification, catalogue, panier, commandes, favoris, avis et espace d’administration — la solution intègre des briques différenciantes : **recherche de produits par image**, **recommandations**, ainsi qu’un **canal de contact client via WhatsApp**.

Sur le plan pédagogique, ce stage s’inscrit dans la formation en **Ingénierie des Systèmes d’Information (ISI)** à la **SUPMTI** (Rabat), année universitaire **2025–2026**. Il a pour objectif de confronter l’étudiante à un projet complet, mené en autonomie, depuis l’analyse du besoin jusqu’à la livraison d’un prototype fonctionnel, testé, conteneurisé et documenté.

Techniquement, l’architecture retenue s’appuie sur une **API REST Laravel**, une interface web **React**, une application mobile **React Native (Expo)** et un microservice de vision par ordinateur en **Python (FastAPI)**, le tout orchestré avec **Docker**. Cette organisation permet de séparer clairement les responsabilités tout en garantissant qu’un même backend alimente plusieurs clients.

Ainsi, ce rapport présente successivement l’organisme d’accueil, le contexte et la problématique du stage, l’analyse des besoins, la conception, la réalisation, les tests, puis le bilan des compétences acquises et des perspectives d’amélioration.

---

# 5. Liste des abréviations

| Sigle | Signification |
|-------|----------------|
| API | Application Programming Interface |
| BDD | Base de Données |
| CI | Continuous Integration (intégration continue) |
| CV | Computer Vision (vision par ordinateur) |
| CRUD | Create, Read, Update, Delete |
| ISI | Ingénierie des Systèmes d’Information |
| ONNX | Open Neural Network Exchange |
| PFA | Projet de Fin d’Année |
| REST | Representational State Transfer |
| SPA | Single Page Application |
| SUPMTI | École Supérieure de Management et de Télécommunication |
| UML | Unified Modeling Language |
| UX | User Experience |

---

# CHAPITRE 1 — Présentation de l’entreprise

## 1.1 Présentation et historique

**Tasmim Web** est une agence web e-marketing marocaine basée à **Casablanca**. Elle intervient dans le **branding**, les **campagnes e-marketing**, ainsi que la **conception et le développement de sites web et d’applications mobiles**.

Positionnée sur le marché digital national, l’agence accompagne entreprises et porteurs de projets dans la construction de leur présence en ligne : identité visuelle, sites vitrines, boutiques e-commerce, applications web et mobiles, et supports de communication print.

**Coordonnées de l’agence**

| Élément | Détail |
|---------|--------|
| Adresse | Rue 14 Amal 2, Imm. 2, 3ᵉ étage, N° 8, Sidi Bernoussi — Casablanca |
| Téléphone | +212 6 66 67 16 07 |
| E-mail | contact@tasmimweb.com |

## 1.2 Activités

Les activités de Tasmim Web s’articulent autour de trois axes principaux :

- **Le digital marketing et le branding** — positionnement de marque, campagnes e-marketing, création d’identité visuelle (logo, flyer, brochure).  
- **Le développement web** — sites vitrines, refontes, intégration web, boutiques e-commerce, applications web.  
- **Le développement mobile** — conception d’applications mobiles.

Le projet **Vivid** s’inscrit naturellement dans cette offre : il combine boutique e-commerce, application web, application mobile et une dimension « expérience utilisateur » enrichie (recherche visuelle, contact WhatsApp).

## 1.3 Environnement de travail

Le stage s’est déroulé en mode **hybride** : présence à Casablanca selon les besoins, et travail à distance pour les phases de développement intensif. L’encadrement professionnel a été assuré par **Hamza Mohammed**.

Sur le plan technique, l’environnement de développement a reposé sur :

- le système d’exploitation **Linux** ;  
- la conteneurisation avec **Docker / Docker Compose** ;  
- le versionnement avec **Git / GitHub** ;  
- un éditeur de code moderne et les navigateurs de test.

Cette configuration, nouvelle pour moi au début du stage, a constitué à la fois une **difficulté initiale** et un **apport majeur** en compétences (voir chapitres 5 et 7).

---

# CHAPITRE 2 — Contexte du stage

## 2.1 Présentation du stage

Le stage de **PFA** s’inscrit dans la formation en **Ingénierie des Systèmes d’Information (ISI)** à la **SUPMTI** (Rabat), année universitaire **2025–2026**. Il vise à confronter l’étudiante à un projet complet, de l’expression du besoin jusqu’à un prototype fonctionnel documenté.

| Élément | Détail |
|---------|--------|
| Organisme d’accueil | Tasmim Web — Casablanca |
| Étudiante | Fatima Ezzahra CHIBANE |
| Sujet | Plateforme e-commerce intelligente multi-supports (**Vivid**) |
| Période | Du 22 juin 2026 au 22 juillet 2026 |
| Durée | 1 mois |
| Modalités | Hybride |
| Organisation du travail | Projet réalisé seule (analyse, conception, développement, tests, documentation) |
| Encadrement professionnel | Hamza Mohammed |

Le fil conducteur a été le suivant : proposer une boutique en ligne complète (catalogue, panier, commandes, administration), tout en intégrant des briques différenciantes — recherche visuelle, recommandations et contact WhatsApp — afin de coller aux attentes actuelles du commerce digital et au positionnement de Tasmim Web.

## 2.2 Cahier des charges

Compte tenu de la durée d’un mois, le cahier des charges a fixé un périmètre ambitieux mais réaliste.

| Priorité | Exigence | Statut |
|----------|----------|--------|
| P1 | API REST sécurisée (authentification, rôles) | Livré |
| P1 | Boutique web (catalogue, panier, commande) | Livré |
| P1 | Espace administrateur | Livré |
| P1 | Application mobile client | Livré |
| P2 | Favoris, avis, coupons | Livré |
| P2 | Recherche de produits par image | Livré |
| P2 | Recommandations | Livré |
| P2 | Conteneurisation Docker + CI | Livré |
| P3 | Paiement réel (Stripe, etc.) | Hors périmètre (simulé) |

## 2.3 Problématique

Le commerce électronique ne se limite plus à un simple catalogue. Les utilisateurs attendent une expérience fluide sur plusieurs supports, une administration fiable, et des fonctionnalités qui réduisent la friction — par exemple retrouver un produit à partir d’une photo, ou contacter rapidement un conseiller.

La problématique du stage peut être formulée ainsi :

> Comment concevoir et réaliser, en un mois et en autonomie, une plateforme e-commerce **moderne**, **évolutive** et **multi-clients** (web et mobile), intégrant des services d’aide à la découverte de produits, tout en respectant les exigences de qualité d’une agence web (architecture claire, tests, déploiement reproductible) ?

## 2.4 Objectifs

### Objectifs généraux

- Analyser un besoin e-commerce et en dériver une architecture cohérente.  
- Développer une solution complète, démontrable et documentée.  
- Mettre en pratique les bonnes pratiques de développement (couches, validation, sécurité, tests).  
- S’approprier un environnement professionnel Linux / Docker.

### Objectifs spécifiques

1. Implémenter le parcours client de bout en bout.  
2. Mettre en place un back-office d’administration.  
3. Publier une API unique consommée par le web et le mobile.  
4. Intégrer un microservice de vision par ordinateur.  
5. Conteneuriser la solution et automatiser une partie des vérifications (CI).  
6. Rédiger le présent rapport de stage.

## 2.5 Méthodologie de travail

La conduite du projet a suivi une approche **itérative**, adaptée à un stage **individuel** d’un mois :

1. **Cadrage** — clarification du besoin et priorisation.  
2. **Conception** — architecture, modèle de données, diagrammes UML (cas d’utilisation, classes, séquences).  
3. **Développement par incréments** — backend, puis web, puis mobile, puis module IA.  
4. **Tests** — PHPUnit, Vitest, scénarios manuels, Cypress en local.  
5. **Stabilisation** — Docker, CI, corrections, documentation.

Les livrables ont été versionnés sur **GitHub** (branche `main`). Des points de suivi avec l’agence ont permis de valider l’avancement malgré le mode hybride.

---

# CHAPITRE 3 — Analyse des besoins

## 3.1 Besoins fonctionnels

Les besoins fonctionnels expriment ce que le système **Vivid** doit permettre de faire, du point de vue des utilisateurs. Ils ont été définis à partir du cahier des charges du stage chez Tasmim Web et couvrent le parcours client, l’administration et les fonctionnalités avancées (recherche visuelle, recommandations, contact WhatsApp).

### Besoins liés au visiteur et au client

- **Consultation du catalogue**  
  Un visiteur doit pouvoir parcourir la liste des produits, filtrer par catégorie, rechercher un article et consulter la fiche détaillée (description, prix, stock, image, avis).

- **Authentification et gestion du compte**  
  Un utilisateur doit pouvoir s’inscrire, se connecter, se déconnecter et consulter ou mettre à jour son profil. L’accès aux fonctionnalités sensibles (panier, commande, favoris) est réservé aux utilisateurs authentifiés.

- **Gestion du panier**  
  Le client doit pouvoir ajouter un produit au panier, modifier les quantités, supprimer une ligne et visualiser le total avant commande.

- **Passage et suivi de commande**  
  Le client doit pouvoir valider sa commande en indiquant une adresse de livraison, appliquer éventuellement un coupon, confirmer l’achat (paiement simulé) et consulter l’historique de ses commandes.

- **Favoris (wishlist)**  
  Le client doit pouvoir ajouter ou retirer un produit de sa liste de favoris et retrouver facilement ces articles.

- **Avis et notations**  
  Le client doit pouvoir laisser une note et un commentaire sur un produit, éventuellement accompagnés d’une image.

- **Recherche de produit par image**  
  Le client doit pouvoir envoyer une photographie afin que le système propose le produit correspondant du catalogue (ou indiquer qu’aucune correspondance fiable n’a été trouvée).

- **Recommandations de produits**  
  Le système doit proposer des suggestions de produits (recommandations générales ou produits similaires), afin d’enrichir l’expérience d’achat.

- **Contact via WhatsApp**  
  Le client doit pouvoir ouvrir rapidement une conversation WhatsApp préremplie pour obtenir des informations ou une assistance.

### Besoins liés à l’administrateur

- **Administration du catalogue**  
  L’administrateur doit pouvoir créer, modifier et désactiver des produits et des catégories, y compris l’upload d’images produits.

- **Suivi des commandes et des utilisateurs**  
  L’administrateur doit pouvoir consulter et mettre à jour le statut des commandes, ainsi que gérer les comptes utilisateurs.

- **Gestion des coupons**  
  L’administrateur doit pouvoir créer et gérer des codes promotionnels.

- **Tableau de bord**  
  L’administrateur doit disposer d’indicateurs synthétiques (activité, commandes, etc.) pour suivre le fonctionnement de la plateforme.

## 3.2 Besoins non fonctionnels

Les besoins non fonctionnels décrivent les **qualités attendues** du système : sécurité, performance, maintenabilité, portabilité et ergonomie. Ils garantissent que la solution reste crédible dans un contexte d’agence web, même pour un prototype de stage.

### Sécurité

- Les mots de passe doivent être stockés de manière sécurisée (hachage).  
- L’authentification API doit s’appuyer sur des tokens (Sanctum) avec une durée de vie limitée.  
- L’accès aux routes sensibles doit être contrôlé selon le rôle (`client` / `admin`).  
- Les entrées utilisateurs doivent être validées côté serveur (Form Requests).  
- Les routes d’authentification et d’IA doivent être protégées contre les abus (limitation de débit).

### Performance et disponibilité

- L’API doit répondre dans des délais acceptables en environnement local.  
- Les images produits doivent être servies de façon fiable via le stockage public.  
- Le service de vision par ordinateur doit pouvoir être démarré et interrogé indépendamment du monolithe backend.

### Maintenabilité et qualité du code

- L’architecture doit respecter une séparation claire des responsabilités (contrôleurs, services, repositories, ressources API).  
- Le code doit rester lisible, structuré et documenté aux points critiques.  
- La solution doit être couverte par des tests automatisés (backend et frontend) et une intégration continue.

### Portabilité et déploiement

- L’ensemble de la stack doit pouvoir être lancé via **Docker Compose**.  
- Une même API doit alimenter à la fois l’application web et l’application mobile.

### Ergonomie

- L’interface doit être claire, responsive et rédigée en français.  
- Les messages d’erreur et de confirmation doivent être compréhensibles.  
- L’expérience doit rester cohérente entre le web et le mobile.

### Évolutivité

- Le module de computer vision doit être isolé (microservice).  
- L’architecture doit permettre d’ajouter ultérieurement un paiement réel, sans remettre en cause le modèle des commandes.

## 3.3 Étude de l’existant

Avant de figer la solution, plusieurs constats ont guidé l’analyse :

- les plateformes SaaS couvrent rapidement l’e-commerce classique, mais offrent peu de maîtrise pédagogique de l’architecture interne ;  
- un simple site vitrine ne répond pas à l’exigence d’API multi-clients ni à l’intégration d’un module de vision ;  
- de nombreuses réalisations académiques s’arrêtent au web, sans application mobile ni démarche qualité (Docker, CI).

Dans le contexte de Tasmim Web, qui propose déjà la conception de boutiques e-commerce et d’applications mobiles, le projet Vivid devait illustrer une capacité à livrer une solution **complète** et **différenciante**.

## 3.4 Choix de la solution

| Option | Avantages | Limites | Décision |
|--------|-----------|---------|----------|
| Monolithe PHP (Blade) | Rapidité initiale | Couplage fort, mobile difficile | Écartée |
| Node.js full-stack | Un seul langage | Moins adapté au choix Laravel retenu | Non retenu comme socle |
| **API Laravel + React + Expo + CV Python** | Séparation nette, multi-clients, IA isolée | Complexité d’intégration | **Retenue** |
| Vision cloud (API externes) | Peu de code local | Coût, dépendance réseau | Écartée (ONNX local) |

---

# CHAPITRE 4 — Conception

## 4.1 Architecture générale

L’architecture de Vivid est **modulaire**. Elle s’organise autour d’une API centrale consommée par plusieurs clients, et d’un microservice dédié à la vision par ordinateur :

```
[ React Web ] -------\
                      \
[ Expo Mobile ] -------→ [ Nginx ] → [ Laravel API ] → [ MySQL ]
                      /                    │
[ Admin (même SPA) ]-/                     ↓
                                 [ CV Service Python ]
                                 (MobileNetV2 ONNX)
```

- **Nginx** : reverse proxy et service des fichiers statiques.  
- **Laravel** : logique métier e-commerce et authentification.  
- **React** : boutique et administration.  
- **Expo** : application mobile.  
- **cv-service** : indexation et recherche visuelle.  
- **MySQL** : persistance des données.

*[Insérer ici la figure d’architecture générale.]*

## 4.2 Diagrammes UML

Les diagrammes UML ont été élaborés durant la phase de conception (cas d’utilisation, classes, séquences). Ils sont à coller dans la version Word du rapport.

### 4.2.1 Cas d’utilisation

Acteurs : **Visiteur**, **Client authentifié**, **Administrateur**.

Principaux cas client : s’inscrire, se connecter, consulter le catalogue, gérer le panier, commander, gérer les favoris, déposer un avis, rechercher par image, contacter via WhatsApp.

Principaux cas admin : gérer produits et catégories, suivre les commandes, administrer utilisateurs et coupons, consulter les indicateurs.

*[Insérer les diagrammes de cas d’utilisation.]*

### 4.2.2 Diagramme de classes

Classes métier structurantes : `User`, `Category`, `Product`, `Cart` / `CartItem`, `Order` / `OrderItem`, `Payment`, `Wishlist`, `Review`, `Coupon`.

*[Insérer le diagramme de classes.]*

### 4.2.3 Diagrammes de séquence

Scénarios représentés :

1. Authentification (login → token Sanctum).  
2. Passage de commande (panier → order → paiement simulé).  
3. Recherche par image (upload → Laravel → cv-service → produit).

*[Insérer les diagrammes de séquence.]*

## 4.3 Base de données

La base de données utilisée est **MySQL 8** (base `ecommerce`). Elle regroupe notamment les tables suivantes :

| Table | Rôle |
|-------|------|
| `users` | Comptes clients et administrateurs |
| `categories` | Catégories de produits |
| `products` | Catalogue (prix, stock, image, promotions) |
| `carts` / `cart_items` | Panier |
| `wishlists` | Favoris |
| `orders` / `order_items` | Commandes et lignes |
| `payments` | Paiements simulés |
| `reviews` | Avis produits |
| `coupons` | Codes promotionnels |
| `personal_access_tokens` | Tokens d’authentification Sanctum |

*[Insérer le schéma relationnel de la base de données.]*

## 4.4 Maquettes / interfaces

L’interface retenue privilégie une identité visuelle claire, un accent rose/magenta pour les appels à l’action, et une navigation structurée (Boutique, Favoris, Commandes, Admin). Les captures d’écran du chapitre 5 servent également de validation visuelle des choix d’ergonomie.

---

# CHAPITRE 5 — Réalisation

## 5.1 Technologies utilisées

| Couche | Technologies |
|--------|----------------|
| Backend | PHP 8.3, Laravel 12, Sanctum, Eloquent, Form Requests, Repository Pattern |
| Frontend web | React 19, Vite, Tailwind CSS, Axios, React Router |
| Mobile | React Native, Expo |
| Computer vision | Python 3.11, FastAPI, ONNX Runtime, MobileNetV2 |
| Base de données | MySQL 8 |
| Infrastructure | Docker Compose, Nginx, GitHub Actions |
| Qualité | PHPUnit, Vitest, Cypress (local), Postman |
| Environnement | Linux |

## 5.2 Description des fonctionnalités

Les fonctionnalités livrées couvrent l’ensemble du périmètre P1/P2 du cahier des charges :

- **Authentification** : inscription, connexion, profil, tokens Bearer.  
- **Catalogue** : liste, filtres, détail produit, stock, promotions.  
- **Panier et commande** : gestion des quantités, adresse, coupons, historique.  
- **Favoris et avis** : wishlist, notes et commentaires.  
- **Administration** : gestion des produits (avec images), catégories, commandes, utilisateurs, coupons et tableaux de bord.  
- **Intelligence artificielle** : recherche par image et recommandations.  
- **Contact** : bouton WhatsApp sur web et mobile.  
- **Exploitation** : Docker Compose et intégration continue (PHPUnit + Vitest).

Le projet a été développé **seule**, ce qui a imposé une organisation stricte : prioriser le cœur métier, puis les extensions, puis la stabilisation.

## 5.3 Captures d’écran commentées

Les captures réalisées doivent être insérées ici, chacune avec une légende et un court commentaire (2 à 3 phrases).

| Figure | Contenu |
|--------|---------|
| 5.1 | Boutique web |
| 5.2 | Détail produit / avis |
| 5.3 | Panier et commande |
| 5.4 | Espace administrateur |
| 5.5 | Application mobile |
| 5.6 | Recherche par photo |
| 5.7 | Bouton WhatsApp |
| 5.8 | Pipeline CI GitHub Actions |

*[Coller les captures d’écran sous chaque légende.]*

## 5.4 Difficultés rencontrées

### 5.4.1 Difficulté principale : première expérience Linux et Docker

La difficulté la plus marquante du stage a été **environnementale**. C’était la **première fois** que je travaillais sous **Linux** et avec **Docker**. Au début, des notions pourtant centrales — droits fichiers, terminal, images et conteneurs, volumes, réseaux Docker, healthchecks — demandaient un temps d’adaptation important. Or l’ensemble du projet reposait sur cette stack pour démarrer backend, frontend, MySQL et service de vision de façon reproductible.

Cette courbe d’apprentissage a temporairement ralenti le démarrage, mais s’est transformée en compétence durable : savoir installer, diagnostiquer et relancer une stack Docker est aujourd’hui un acquis concret du stage.

### 5.4.2 Autres difficultés techniques

- Cohérence des **URLs d’images** entre boutique, panier, favoris et commandes.  
- Intégration du **module CV** (modèle ONNX, healthcheck, indexation).  
- Accès de l’**application mobile** à l’API sur le réseau local (`API_HOST_IP`).  
- Charge du job **Cypress** dans la CI GitHub — E2E conservé en local.  
- Synchronisation **migrations / schéma** (exemple : colonne `original_price`).  
- Conduite du projet **en autonomie** sur un mois : priorisation permanente.

## 5.5 Solutions apportées

| Difficulté | Solution |
|------------|----------|
| Linux / Docker débutant | Tutoriels officiels, pratique quotidienne, scripts (`setup.sh`, `docker compose`), documentation personnelle |
| Images incorrectes (web) | Utilitaire `resolveMediaUrl` et ressources API (`ProductResource`, panier, favoris) |
| Modèle ONNX absent | Embarquement dans l’image Docker du service CV |
| Mobile | Script `start.sh` et configuration IP locale |
| CI trop lourde | Pipeline allégé : PHPUnit + Vitest |
| Schéma obsolète | Exécution des migrations (`php artisan migrate`) |
| Charge de travail individuelle | Découpage en lots hebdomadaires et jalons clairs |

---

# CHAPITRE 6 — Tests et validation

## 6.1 Méthodologie de test

La validation du projet a combiné plusieurs niveaux de test :

1. **PHPUnit** — authentification, panier, checkout, favoris, admin, santé API, IA.  
2. **Vitest** — Login, ProductCard, ProtectedRoute.  
3. **Cypress** — parcours checkout (exécution locale).  
4. **Recette manuelle** — scénarios web et mobile.  
5. **CI GitHub Actions** — PHPUnit et Vitest à chaque push sur `main`.

## 6.2 Résultats

| Niveau | Outil | Périmètre | CI |
|--------|-------|-----------|-----|
| API / métier | PHPUnit | Auth, Cart, Checkout, Wishlist, Admin, Health, AI | Oui |
| UI unitaire | Vitest | Login, ProductCard, ProtectedRoute | Oui |
| E2E | Cypress | Checkout | Local |
| Exploration | Manuel + Postman | Smoke API | Disponible |

Les tests automatisés intégrés à la CI permettent de vérifier rapidement la non-régression des fonctionnalités critiques après chaque modification.

*[Insérer une capture d’un run de tests / GitHub Actions réussi.]*

## 6.3 Validation des fonctionnalités

Les exigences P1 et P2 du cahier des charges ont été démontrées. Le paiement réel, placé hors périmètre, est couvert par un **paiement simulé**.

Checklist de recette :

- Création de compte et connexion  
- Parcours d’achat complet  
- Gestion admin d’un produit (y compris image)  
- Favoris et cohérence des visuels  
- Recherche par image sur un produit indexé  
- Ouverture WhatsApp  
- Démarrage Docker documenté  

La validation fonctionnelle a été effectuée en fin de stage (juillet 2026), sous le suivi de l’encadrant professionnel **Hamza Mohammed**.

---

# CHAPITRE 7 — Bilan

## 7.1 Compétences acquises

- **Techniques :** API REST Laravel, SPA React, mobile Expo, microservice Python, Git, Linux, Docker, CI.  
- **Méthodologiques :** découpage d’un projet d’un mois, UML, documentation, priorisation.  
- **Transverses :** autonomie, organisation en mode hybride, sens du livrable démontrable.

## 7.2 Difficultés rencontrées

Outre la prise en main de **Linux** et **Docker**, la difficulté majeure a été de **concilier ambition fonctionnelle et délai d’un mois**, en travaillant **seule**. Les arbitrages (paiement simulé, Cypress hors CI) ont permis de préserver la qualité du cœur de la solution.

## 7.3 Apports du stage

Ce PFA a constitué une immersion concrète dans les métiers d’une agence web e-marketing marocaine. Il m’a permis de passer d’une vision « écrire du code » à une vision « livrer un système installable, testable et présentable ». L’expérience hybride et l’autonomie ont renforcé mon organisation personnelle.

## 7.4 Perspectives d’amélioration

Bien que le projet Vivid soit fonctionnel dans le périmètre du PFA, plusieurs axes d’amélioration peuvent être envisagés :

### À court terme

- **Élargir la couverture de tests** (davantage de scénarios PHPUnit/Vitest) et intégrer un test E2E allégé dans la CI.  
- **Améliorer le monitoring local** (logs centralisés, tableaux de bord d’erreurs) pour faciliter le diagnostic.  
- **Enrichir la documentation utilisateur** (guide admin et guide client) destinée à une éventuelle reprise par l’agence.

### À moyen terme

- **Intégrer un paiement réel** (par exemple Stripe), en s’appuyant sur le modèle de commandes déjà en place.  
- **Ajouter des notifications** (e-mail ou SMS) pour la confirmation de commande et le suivi de statut.  
- **Préparer un déploiement distant** (HTTPS, variables d’environnement de production, sauvegardes MySQL).

### À plus long terme

- **Affiner les recommandations** (historique d’achat, scoring plus riche).  
- **Optimiser les images Docker** (builds multi-stage) en vue d’une mise en production.  
- **Étendre le module CV** (meilleure tolérance aux photos prises en conditions réelles, réindexation automatisée).

Ces perspectives ne remettent pas en cause le livrable actuel ; elles dessinent une feuille de route réaliste pour faire évoluer Vivid d’un prototype de stage vers une solution plus proche d’un produit industrialisé.

---

# Conclusion générale

Le stage effectué du **22 juin au 22 juillet 2026** chez **Tasmim Web** (Casablanca), en modalité **hybride** et sous l’encadrement de **Hamza Mohammed**, a abouti à la réalisation de **Vivid**, une plateforme e-commerce intelligente multi-supports. Conduit en **autonomie** dans le cadre du PFA à la **SUPMTI** (filière ISI, Rabat), ce travail a couvert l’analyse, la conception UML, le développement full-stack, les tests et la documentation.

Les objectifs pédagogiques sont atteints : architecture professionnelle, maîtrise d’un socle contemporain, intégration d’un module de vision par ordinateur, et appropriation d’outils essentiels — en particulier **Linux** et **Docker**, découverts pour la première fois durant ce stage. Les limites conscientisées (paiement simulé, E2E hors CI) ouvrent une feuille de route claire, détaillée dans les perspectives d’amélioration.

Ce projet constitue ainsi une base solide pour la soutenance académique et, le cas échéant, pour une poursuite au sein de l’agence ou un déploiement réel.

---

# Bibliographie

1. Documentation Laravel. *Laravel Documentation*. Consulté en 2026.  
2. Documentation React. *React Documentation*. Consulté en 2026.  
3. Documentation Expo. *Expo Documentation*. Consulté en 2026.  
4. Documentation FastAPI. Consulté en 2026.  
5. ONNX Model Zoo — MobileNet. Consulté en 2026.

---

# Webographie

- Laravel : https://laravel.com/docs  
- React : https://react.dev  
- Expo : https://docs.expo.dev  
- Docker Compose : https://docs.docker.com/compose/  
- GitHub Actions : https://docs.github.com/actions  
- Dépôt du projet : https://github.com/fatima-ezzahra-chibane/ecommerce  
- Contact Tasmim Web : contact@tasmimweb.com — +212 6 66 67 16 07  
- Adresse : Rue 14 Amal 2, Imm. 2, 3ᵉ étage N° 8, Sidi Bernoussi — Casablanca  

---

# Annexes

**Annexe A** — Cahier des charges  
**Annexe B** — Diagrammes UML (cas d’utilisation, classes, séquences)  
**Annexe C** — Captures d’écran complémentaires  
**Annexe D** — Logos SUPMTI et Tasmim Web  
**Annexe E** — Collection Postman / exemples d’API  
**Annexe F** — Guide de démarrage Docker  

---

**Version :** 3.0 — rapport complété et peaufiné (infos fournies : SUPMTI Rabat, Hamza Mohammed, stage hybride, autonomie, perspectives).
