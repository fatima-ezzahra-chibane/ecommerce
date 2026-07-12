# Vivid Computer Vision Service

Recherche de produit par **image identique** (pas de similarité floue).

## Stack

- **Python 3.11** + FastAPI
- **OpenCV ORB** (descripteurs visuels locaux)
- **BFMatcher** + ratio test de Lowe

## Principe

1. Chaque image produit du catalogue est indexée (`/index/url`)
2. L'utilisateur envoie une photo (`POST /search`)
3. Le service compare les points ORB
4. **Retourne 1 `product_id`** si correspondance stricte, sinon **`null`**

## Démarrage

```bash
docker compose up -d --build cv-service
docker compose exec backend php artisan products:index-visuals --fresh
```

## Test manuel

```bash
# Télécharger l'image d'un produit du catalogue
curl -sL -o /tmp/produit.jpg "https://picsum.photos/seed/smartphone-pro-x/400/400"

# Rechercher
curl -X POST http://localhost:8090/search -F "file=@/tmp/produit.jpg"
# → {"product_id":1,"match_count":858,"confidence":1.0}
```

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `CV_MIN_GOOD_MATCHES` | 18 | Correspondances ORB minimum |
| `CV_MATCH_RATIO` | 0.75 | Ratio test de Lowe |
| `CV_MIN_CONFIDENCE_GAP` | 5 | Écart minimum vs 2e meilleur |

## API Laravel

`POST /api/v1/ai/search-image` — proxy vers ce service.
