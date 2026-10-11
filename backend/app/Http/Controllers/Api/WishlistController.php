<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\WishlistItemResource;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::where('user_id', $request->user()->id)
            ->whereHas('product', fn ($q) => $q->active())
            ->with(['product' => fn ($q) => $q->with('category')->withAvg('reviews', 'rating')])
            ->get();

        return response()->json([
            'data' => WishlistItemResource::collection($items),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', Rule::exists('products', 'id')->where('status', 'active')],
        ], [
            'product_id.exists' => 'Ce produit n\'est pas disponible.',
        ]);

        $item = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'],
        ]);

        $item->load('product.category');

        return response()->json([
            'message' => 'Ajouté aux favoris.',
            'data' => new WishlistItemResource($item),
        ], 201);
    }

    public function destroy(Request $request, int $productId): JsonResponse
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('product_id', $productId)
            ->delete();

        return response()->json(['message' => 'Retiré des favoris.']);
    }
}
