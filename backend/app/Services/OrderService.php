<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private CartService $cartService,
        private OrderRepositoryInterface $orders,
    ) {}

    public function checkout(User $user, array $data): Order
    {
        $cart = $this->cartService->getCart($user);

        if ($cart->items->isEmpty()) {
            throw ValidationException::withMessages(['cart' => ['Panier vide.']]);
        }

        return DB::transaction(function () use ($user, $cart, $data) {
            $subtotal = (float) $cart->items->sum(fn ($item) => $item->product->price * $item->quantity);
            $coupon = $this->resolveCoupon($data['coupon_code'] ?? null, $subtotal);
            $discount = $coupon?->discountFor($subtotal) ?? 0;

            $total = max(0, $subtotal - $discount);

            $order = $this->orders->create([
                'user_id' => $user->id,
                'coupon_id' => $coupon?->id,
                'total_price' => $total,
                'status' => 'pending',
                'shipping_address' => $data['shipping_address'],
                'coupon_code' => $coupon?->code,
                'discount' => $discount,
            ]);

            foreach ($cart->items as $item) {
                if ($item->product->status !== 'active') {
                    throw ValidationException::withMessages([
                        'cart' => ["{$item->product->name} n'est plus disponible."],
                    ]);
                }
                if ($item->product->stock < $item->quantity) {
                    throw ValidationException::withMessages([
                        'stock' => ["Stock insuffisant pour {$item->product->name}."],
                    ]);
                }

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'quantity' => $item->quantity,
                    'price' => $item->product->price,
                ]);

                $item->product->decrement('stock', $item->quantity);
            }

            $paymentMethod = $data['payment_method'] ?? 'card';

            // Paiement simulé : carte/PayPal encaissés tout de suite, espèces à la livraison
            Payment::create([
                'order_id' => $order->id,
                'payment_method' => $paymentMethod,
                'amount' => $total,
                'status' => $paymentMethod === 'cash' ? 'pending' : 'completed',
                'transaction_id' => 'TXN-'.uniqid(),
            ]);

            $this->cartService->clear($user);

            return $order->load(['items.product', 'payment']);
        });
    }

    /**
     * Livrée et annulée sont des statuts finaux.
     * Annulation : stock restitué, paiement remboursé (ou échoué s'il n'avait pas été encaissé).
     * Livraison : un paiement à la livraison devient encaissé.
     */
    public function changeStatus(Order $order, string $status): Order
    {
        if ($order->status === $status) {
            return $order->fresh(['items.product', 'payment']);
        }

        if (in_array($order->status, ['delivered', 'cancelled'], true)) {
            throw ValidationException::withMessages([
                'status' => ['Une commande livrée ou annulée ne peut plus changer de statut.'],
            ]);
        }

        return DB::transaction(function () use ($order, $status) {
            $order->load(['items.product', 'payment']);

            if ($status === 'cancelled') {
                foreach ($order->items as $item) {
                    $item->product?->increment('stock', $item->quantity);
                }
                $order->payment?->update([
                    'status' => $order->payment->status === 'completed' ? 'refunded' : 'failed',
                ]);
            }

            if ($status === 'delivered' && $order->payment?->status === 'pending') {
                $order->payment->update(['status' => 'completed']);
            }

            return $this->orders->updateStatus($order, $status);
        });
    }

    private function resolveCoupon(?string $code, float $subtotal): ?Coupon
    {
        $code = trim((string) $code);
        if ($code === '') {
            return null;
        }

        // Verrou : deux commandes simultanées ne peuvent pas dépasser usage_limit
        $coupon = Coupon::where('code', $code)->lockForUpdate()->first();
        $reason = $coupon ? $coupon->rejectionReason($subtotal) : 'Code promo invalide.';

        if ($reason !== null) {
            throw ValidationException::withMessages(['coupon_code' => [$reason]]);
        }

        return $coupon;
    }

    public function userOrders(User $user): LengthAwarePaginator
    {
        return $this->orders->paginateByUser($user);
    }
}
