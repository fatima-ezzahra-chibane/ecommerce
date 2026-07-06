<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request): JsonResponse
    {
        $cart = $this->cartService->getCart($request->user());

        return response()->json(['data' => $cart]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:99',
        ]);

        $cart = $this->cartService->addItem(
            $request->user(),
            $validated['product_id'],
            $validated['quantity'] ?? 1
        );

        return response()->json(['message' => 'Produit ajouté au panier.', 'data' => $cart]);
    }

    public function update(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate(['quantity' => 'required|integer|min:0|max:99']);
        $cart = $this->cartService->updateQuantity($request->user(), $itemId, $validated['quantity']);

        return response()->json(['message' => 'Panier mis à jour.', 'data' => $cart]);
    }

    public function destroy(Request $request, int $itemId): JsonResponse
    {
        $cart = $this->cartService->removeItem($request->user(), $itemId);

        return response()->json(['message' => 'Article supprimé.', 'data' => $cart]);
    }
}
