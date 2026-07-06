<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private CartService $cartService) {}

    public function checkout(User $user, array $data): Order
    {
        $cart = $this->cartService->getCart($user);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => ['Panier vide.']]);
        }

        return DB::transaction(function () use ($user, $cart, $data) {
            $subtotal = $cart->items->sum(fn ($item) => $item->product->price * $item->quantity);
            $discount = 0;
            $couponCode = null;

            if (! empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', $data['coupon_code'])->first();
                if ($coupon && $coupon->isValid()) {
                    $couponCode = $coupon->code;
                    $discount = $coupon->type === 'percent'
                        ? $subtotal * ($coupon->discount / 100)
                        : $coupon->discount;
                }
            }

            $total = max(0, $subtotal - $discount);

            $order = Order::create([
                'user_id' => $user->id,
                'total_price' => $total,
                'status' => 'pending',
                'shipping_address' => $data['shipping_address'],
                'coupon_code' => $couponCode,
                'discount' => $discount,
            ]);

            foreach ($cart->items as $item) {
                if ($item->product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => ["Stock insuffisant pour {$item->product->name}."],
                    ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $data['payment_method'] ?? 'card',
                'amount' => $total,
                'status' => 'completed',
                'transaction_id' => 'TXN-'.uniqid(),
            ]);

            $this->cartService->clear($user);

            return $order->load(['items.product', 'payment']);
        });
    }

    public function userOrders(User $user)
    {
        return Order::where('user_id', $user->id)
            ->with(['items.product', 'payment'])
            ->latest()
            ->paginate(10);
    }
}
