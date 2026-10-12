<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class CartService
{
    /** Un seul panier par client (index unique carts.user_id). */
    public function getOrCreateCart(User $user): Cart
    {
        return $user->cart()->firstOrCreate();
    }

    public function getCart(User $user): Cart
    {
        $cart = $this->getOrCreateCart($user);
        $cart->load(['items.product.category']);

        return $cart;
    }

    public function addItem(User $user, int $productId, int $quantity = 1): Cart
    {
        $product = Product::active()->findOrFail($productId);
        $cart = $this->getOrCreateCart($user);

        $item = CartItem::where('cart_id', $cart->id)->where('product_id', $productId)->first();
        $this->ensureInStock($product, ($item?->quantity ?? 0) + $quantity);

        if ($item) {
            $item->update(['quantity' => $item->quantity + $quantity]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $productId,
                'quantity' => $quantity,
            ]);
        }

        return $this->getCart($user);
    }

    public function updateQuantity(User $user, int $itemId, int $quantity): Cart
    {
        $cart = $this->getOrCreateCart($user);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($itemId);

        if ($quantity <= 0) {
            $item->delete();
        } else {
            $this->ensureInStock($item->product, $quantity);
            $item->update(['quantity' => $quantity]);
        }

        return $this->getCart($user);
    }

    public function removeItem(User $user, int $itemId): Cart
    {
        $cart = $this->getOrCreateCart($user);
        CartItem::where('cart_id', $cart->id)->where('id', $itemId)->delete();

        return $this->getCart($user);
    }

    private function ensureInStock(Product $product, int $quantity): void
    {
        if ($quantity > $product->stock) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant : {$product->stock} disponible(s) pour {$product->name}."],
            ]);
        }
    }

    public function clear(User $user): void
    {
        $cart = $this->getOrCreateCart($user);
        $cart->items()->delete();
    }
}
