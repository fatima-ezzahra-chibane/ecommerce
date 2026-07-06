<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Repositories\Contracts\ProductRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private ProductRepositoryInterface $products) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'category_id', 'min_price', 'max_price', 'sort']);
        $paginated = $this->products->paginate($filters, (int) $request->get('per_page', 12));

        return response()->json([
            'data' => ProductResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $product = $this->products->findById($id);

        if (! $product || $product->status !== 'active') {
            return response()->json(['message' => 'Produit introuvable.'], 404);
        }

        return response()->json(['data' => new ProductResource($product)]);
    }
}
