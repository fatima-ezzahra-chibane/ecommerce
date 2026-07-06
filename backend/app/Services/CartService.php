<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CartService
{
    public function getOrCreateCart(User $user): Cart
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
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

    public function clear(User $user): void
    {
        $cart = $this->getOrCreateCart($user);
        $cart->items()->delete();
    }
}
