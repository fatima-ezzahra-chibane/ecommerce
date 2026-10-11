<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = $this->createUser(role: 'admin');
    }

    private function placeOrder(Product $product, int $quantity, string $paymentMethod): Order
    {
        $this->actingAsUser();
        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => $quantity])->assertSuccessful();
        $this->api('POST', '/orders', [
            'shipping_address' => '12 rue Test, Rabat',
            'payment_method' => $paymentMethod,
        ])->assertCreated();

        $this->actingAsUser($this->admin);

        return Order::with('payment')->latest('id')->firstOrFail();
    }

    private function setStatus(Order $order, string $status)
    {
        return $this->api('PATCH', "/admin/orders/{$order->id}/status", ['status' => $status]);
    }

    public function test_card_payment_is_completed_and_cash_payment_waits_for_delivery(): void
    {
        $product = Product::factory()->create(['price' => 50, 'stock' => 10]);

        $card = $this->placeOrder($product, 1, 'card');
        $this->assertSame('completed', $card->payment->status);

        $cash = $this->placeOrder($product, 1, 'cash');
        $this->assertSame('pending', $cash->payment->status);

        $this->setStatus($cash, 'shipped')->assertOk();
        $this->assertSame('pending', $cash->payment->fresh()->status);

        $this->setStatus($cash, 'delivered')->assertOk()->assertJsonPath('data.status', 'delivered');
        $this->assertSame('completed', $cash->payment->fresh()->status);
    }

    public function test_cancelling_paid_order_restores_stock_and_refunds(): void
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $order = $this->placeOrder($product, 3, 'card');
        $this->assertSame(2, $product->fresh()->stock);

        $this->setStatus($order, 'cancelled')->assertOk()->assertJsonPath('data.status', 'cancelled');

        $this->assertSame(5, $product->fresh()->stock);
        $this->assertSame('refunded', $order->payment->fresh()->status);
    }

    public function test_cancelling_unpaid_cash_order_marks_payment_failed(): void
    {
        $product = Product::factory()->create(['stock' => 4]);
        $order = $this->placeOrder($product, 2, 'cash');

        $this->setStatus($order, 'cancelled')->assertOk();

        $this->assertSame(4, $product->fresh()->stock);
        $this->assertSame('failed', $order->payment->fresh()->status);
    }

    public function test_delivered_and_cancelled_orders_are_final(): void
    {
        $product = Product::factory()->create(['stock' => 10]);

        $delivered = $this->placeOrder($product, 1, 'card');
        $this->setStatus($delivered, 'delivered')->assertOk();
        $this->setStatus($delivered, 'cancelled')->assertUnprocessable()->assertJsonValidationErrors(['status']);

        $cancelled = $this->placeOrder($product, 1, 'card');
        $this->setStatus($cancelled, 'cancelled')->assertOk();
        $this->setStatus($cancelled, 'pending')->assertUnprocessable();

        $this->assertSame(9, $product->fresh()->stock, 'Le stock ne doit être restitué qu\'une seule fois.');
    }

    public function test_setting_same_status_twice_does_not_restock_twice(): void
    {
        $product = Product::factory()->create(['stock' => 10]);
        $order = $this->placeOrder($product, 2, 'card');

        $this->setStatus($order, 'cancelled')->assertOk();
        $this->setStatus($order, 'cancelled')->assertOk();

        $this->assertSame(10, $product->fresh()->stock);
    }
}
