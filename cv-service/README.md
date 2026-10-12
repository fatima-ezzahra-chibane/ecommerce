# Vivid Computer Vision Service

Recherche de produits par **photo** via embeddings **MobileNetV2 (ONNX)**.

## Stack

- **Python 3.11** + FastAPI
- **ONNX Runtime** + MobileNetV2 ImageNet
- Similarité cosinus + seuils (`CV_MIN_SIMILARITY`, `CV_MIN_SIMILARITY_GAP`)

## Principe

1. Chaque image catalogue est indexée (`/index/url`) → vecteur 1000-d
2. L’utilisateur envoie une photo (`POST /search`)
3. Le service compare les embeddings
4. Retourne **1 `product_id`** si match fiable, sinon **`null`**

Le modèle `mobilenetv2-12.onnx` est **téléchargé et embarqué dans l’image Docker** au build (aucun fichier modèle dans le dépôt).

## Endpoints

| Méthode | Route | Rôle |
|---------|-------|------|
| `GET` | `/health` | État + nombre de produits indexés |
| `POST` | `/index/url` | Indexer l'image d'un produit (`product_id`, `image_url`) |
| `POST` | `/search` | Rechercher un produit à partir d'une photo (`file`) |
| `DELETE` | `/index/{product_id}` | Retirer un produit (désactivé ou supprimé) |
| `DELETE` | `/index` | Vider l'index |

## Tests

```bash
docker compose run --rm -v ./cv-service/tests:/app/tests cv-service python -m unittest discover -s tests -t . -v
```

## Démarrage

```bash
docker compose up -d --build cv-service
docker compose exec backend php artisan products:index-visuals --fresh
```

Health : http://localhost:8090/health

## Variables d'environnement

| Variable | Défaut | Description |
|----------|--------|-------------|
| `CV_ONNX_PATH` | `/app/models/mobilenetv2-12.onnx` | Chemin du modèle |
| `CV_MIN_SIMILARITY` | `0.72` | Seuil de similarité |
| `CV_MIN_SIMILARITY_GAP` | `0.035` | Écart min vs 2e meilleur |
| `CV_MAX_IMAGE_DIM` | `1024` | Redimensionnement max |

## API Laravel

`POST /api/v1/ai/search-image` — proxy vers ce service.
