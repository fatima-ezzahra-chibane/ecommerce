<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderHistoryTest extends TestCase
{
    use RefreshDatabase;

    private function placeOrder(): int
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 10]);
        $this->api('POST', '/cart', ['product_id' => $product->id]);

        return $this->api('POST', '/orders', [
            'shipping_address' => 'Adresse test',
            'payment_method' => 'cash',
        ])->assertCreated()->json('data.id');
    }

    public function test_user_sees_only_own_orders(): void
    {
        $this->actingAsUser();
        $this->placeOrder();

        $this->actingAsUser();
        $mine = $this->placeOrder();

        $this->api('GET', '/orders')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mine)
            ->assertJsonPath('meta.total', 1);
    }

    public function test_user_can_view_own_order_detail(): void
    {
        $this->actingAsUser();
        $id = $this->placeOrder();

        $this->api('GET', "/orders/{$id}")
            ->assertOk()
            ->assertJsonPath('data.id', $id)
            ->assertJsonPath('data.payment.payment_method', 'cash')
            ->assertJsonStructure(['data' => ['items' => [['product_name', 'quantity', 'price']]]]);
    }

    public function test_user_cannot_view_someone_else_order(): void
    {
        $this->actingAsUser();
        $id = $this->placeOrder();

        $this->actingAsUser();
        $this->api('GET', "/orders/{$id}")->assertNotFound();
    }

    public function test_guest_cannot_list_orders(): void
    {
        $this->api('GET', '/orders')->assertUnauthorized();
        $this->assertSame(0, Order::count());
    }
}
