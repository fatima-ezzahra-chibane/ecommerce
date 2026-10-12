<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\Ai\ImageSearchService;
use App\Services\Ai\RecommendationService;
use App\Services\Ai\VisionSearchClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        private RecommendationService $recommendations,
        private ImageSearchService $imageSearch,
        private VisionSearchClient $vision,
    ) {}

    public function status(): JsonResponse
    {
        $cvStats = $this->vision->stats();

        return response()->json([
            'data' => [
                'cv_service' => $cvStats,
                'features' => [
                    'recommendations' => true,
                    'image_search' => ($cvStats['status'] ?? '') === 'ok',
                ],
            ],
        ]);
    }

    public function recommendations(Request $request): JsonResponse
    {
        $limit = min(max((int) $request->get('limit', 8), 1), 20);
        // Route publique : le token Bearer n'est lu que si on interroge explicitement la garde sanctum
        $products = $this->recommendations->forUser($request->user('sanctum'), $limit);

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    public function productRecommendations(int $productId): JsonResponse
    {
        $product = Product::active()->findOrFail($productId);
        $products = $this->recommendations->forProduct($product);

        return response()->json([
            'data' => ProductResource::collection($products),
        ]);
    }

    public function searchImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
        ], [
            'image.required' => 'Veuillez sélectionner une image.',
            'image.image' => 'Le fichier doit être une image.',
            'image.uploaded' => 'Impossible d\'envoyer l\'image (max 4 Mo, formats JPEG/PNG/WebP).',
            'image.mimes' => 'Formats acceptés : JPEG, PNG, WebP.',
            'image.max' => 'Image trop lourde (maximum 4 Mo).',
        ]);

        $result = $this->imageSearch->search($request->file('image'));

        if ($result['source'] === 'unavailable') {
            return response()->json([
                'message' => 'Service computer vision indisponible. Vérifiez que cv-service tourne (docker compose up -d).',
                'data' => [
                    'product_id' => null,
                    'match_count' => 0,
                    'confidence' => 0,
                    'source' => 'unavailable',
                    'products' => [],
                ],
            ], 503);
        }

        return response()->json([
            'data' => [
                'product_id' => $result['product_id'],
                'match_count' => $result['match_count'],
                'confidence' => $result['confidence'],
                'source' => $result['source'],
                'products' => ProductResource::collection($result['products']),
            ],
        ]);
    }
}
