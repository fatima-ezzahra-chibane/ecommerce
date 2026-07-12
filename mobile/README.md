# Vivid Mobile — React Native (Expo)

Application mobile connectée à la même API Laravel que le frontend web.

## Démarrage complet (VirtualBox + téléphone)

### 1. Stack Docker (dans la VM)

```bash
cd ~/ecommerce
docker compose up -d
```

Vérifier l'API :

```bash
curl http://localhost:8080/api/v1/products
```

### 2. Index computer vision (une fois, ou après ajout de produits)

```bash
docker compose exec backend php artisan products:index-visuals --fresh
curl http://localhost:8090/health
```

### 3. Expo mobile

```bash
cd ~/ecommerce/mobile
API_HOST_IP=192.168.8.103 ./start.sh
```

Mode **LAN** par défaut (recommandé VirtualBox). Tunnel ngrok optionnel : `EXPO_MODE=tunnel ./start.sh`

Remplace `192.168.8.103` par l'IP WiFi de ton **PC hôte** (pas `10.0.2.15` de la VM).

Trouver l'IP hôte : `ipconfig` (Windows) ou `ifconfig` / Paramètres réseau.

### 4. VirtualBox — redirections de ports (PC hôte → VM)

Paramètres VM → Réseau → NAT → Redirection de ports :

| Nom | Port hôte | Port invité | Service |
|-----|-----------|-------------|---------|
| api | 8080 | 8080 | API Laravel |
| metro | 8081 | 8081 | Bundler Expo |
| expo | 19000 | 19000 | Serveur Expo |

IP invité : `10.0.2.15`

### 5. Téléphone

- Même WiFi que le PC
- App **Expo Go** installée
- Scanner le QR code (doit afficher `exp://192.168.x.x:8081`)
- Test API dans le navigateur du téléphone : `http://192.168.x.x:8080/api/v1/products`

## Accès web (dans la VM)

| URL | Service |
|-----|---------|
| http://localhost:5173 | Boutique React |
| http://localhost:8080/api/v1 | API REST |
| http://localhost:8082 | PhpMyAdmin |

Depuis le PC hôte (avec redirection port 8080) : `http://192.168.x.x:8080`

## Compte démo

- `client@shop.com` / `password`

## Recherche par photo (CV)

- Bouton 📷 dans la boutique
- **Correspondance stricte** : 1 produit identique ou message « Aucun produit identique »
- Pour tester : enregistre l'image d'un produit du catalogue, puis envoie **la même** photo
- Après ajout d'un produit par l'admin, réindexer les visuels :

```bash
docker compose exec backend php artisan products:index-visuals
```

## Commandes utiles

```bash
# Tout arrêter
docker compose down

# Logs backend
docker compose logs -f backend

# Relancer uniquement l'API
docker compose up -d backend nginx mysql cv-service
```
