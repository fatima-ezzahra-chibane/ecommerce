<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Repositories\Contracts\ProductRepositoryInterface;
use App\Services\Ai\VisionSearchClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminProductController extends Controller
{
    public function __construct(
        private ProductRepositoryInterface $products,
        private VisionSearchClient $vision,
    ) {}

    public function index(): JsonResponse
    {
        $paginated = Product::with('category')->latest()->paginate(15);

        return response()->json([
            'data' => ProductResource::collection($paginated),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['slug'] = Str::slug($validated['name']).'-'.Str::random(4);
        $validated['status'] = $validated['status'] ?? 'active';

        $product = $this->products->create($validated);

        return response()->json([
            'message' => 'Produit créé.',
            'data' => new ProductResource($product->load('category')),
        ], 201);
    }

    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = Product::findOrFail($id);
        $product = $this->products->update($product, $request->validated());

        return response()->json([
            'message' => 'Produit mis à jour.',
            'data' => new ProductResource($product->load('category')),
        ]);
    }

    public function uploadImage(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        $product = Product::findOrFail($id);

        if ($product->image && str_contains($product->image, '/storage/products/')) {
            $old = str_replace('/storage/', '', $product->image);
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('image')->store('products', 'public');
        $product->update(['image' => '/storage/'.$path]);
        $product->refresh();

        if ($product->status === 'active') {
            $this->vision->indexFromUrl($product->id, 'http://nginx'.$product->image);
        }

        return response()->json([
            'message' => 'Image téléversée.',
            'data' => new ProductResource($product->fresh('category')),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->products->delete(Product::findOrFail($id));

        return response()->json(['message' => 'Produit supprimé.']);
    }
}
