<?php

namespace App\Services\Ai;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;

class ImageSearchService
{
    public function __construct(private VisionSearchClient $vision) {}

    /**
     * Correspondance stricte : 0 ou 1 produit (le même visuel que le catalogue).
     *
     * @return array{product_id: ?int, match_count: int, confidence: float, products: Collection, source: string}
     */
    public function search(UploadedFile $image): array
    {
        $unavailable = [
            'product_id' => null,
            'match_count' => 0,
            'confidence' => 0.0,
            'products' => collect(),
            'source' => 'unavailable',
        ];

        if (! $this->vision->isAvailable()) {
            return $unavailable;
        }

        try {
            $result = $this->vision->search($image);
        } catch (\Throwable) {
            return $unavailable;
        }
        $productId = $result['product_id'] ?? null;
        $confidence = (float) ($result['confidence'] ?? 0);

        // Le seuil de similarité est appliqué par le service CV (CV_MIN_SIMILARITY)
        if (! $productId) {
            return [
                'product_id' => null,
                'match_count' => (int) ($result['match_count'] ?? 0),
                'confidence' => $confidence,
                'products' => collect(),
                'source' => 'mobilenetv2_onnx',
            ];
        }

        $product = Product::query()->active()->with(['category'])->find($productId);

        return [
            'product_id' => $product?->id,
            'match_count' => (int) ($result['match_count'] ?? 0),
            'confidence' => $confidence,
            'products' => $product ? collect([$product]) : collect(),
            'source' => 'mobilenetv2_onnx',
        ];
    }
}
