<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartRequest;
use App\Http\Requests\Cart\UpdateCartRequest;
use App\Http\Resources\CartResource;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user());

        return response()->json(['data' => new CartResource($cart)]);
    }

    public function store(StoreCartRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $cart = $this->cartService->addItem(
            $request->user(),
            $validated['product_id'],
            $validated['quantity'] ?? 1
        );

        return response()->json([
            'message' => 'Produit ajouté au panier.',
            'data' => new CartResource($cart),
        ]);
    }

    public function update(UpdateCartRequest $request, int $itemId): JsonResponse
    {
        $validated = $request->validated();
        $cart = $this->cartService->updateQuantity($request->user(), $itemId, $validated['quantity']);

        return response()->json([
            'message' => 'Panier mis à jour.',
            'data' => new CartResource($cart),
        ]);
    }

    public function destroy(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->cartService->removeItem($request->user(), $itemId);

        return response()->json([
            'message' => 'Article supprimé.',
            'data' => new CartResource($cart),
        ]);
    }
}
