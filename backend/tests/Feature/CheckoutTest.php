<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_fails_with_empty_cart(): void
    {
        $this->actingAsUser();

        $response = $this->api('POST', '/orders', [
            'shipping_address' => '123 rue Test, Casablanca',
            'payment_method' => 'card',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['cart']);
    }

    public function test_user_can_checkout_successfully(): void
    {
        $user = $this->actingAsUser();
        $product = Product::factory()->create(['price' => 100, 'stock' => 10]);

        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 2]);

        $response = $this->api('POST', '/orders', [
            'shipping_address' => '123 rue Test, Casablanca',
            'payment_method' => 'card',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Commande passée avec succès.');

        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_price' => 200,
            'status' => 'pending',
        ]);

        $this->assertDatabaseHas('payments', [
            'payment_method' => 'card',
            'status' => 'completed',
            'amount' => 200,
        ]);

        $product->refresh();
        $this->assertSame(8, $product->stock);

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_checkout_applies_percent_coupon(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);

        Coupon::create([
            'code' => 'TEST10',
            'discount' => 10,
            'type' => 'percent',
            'is_active' => true,
        ]);

        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $response = $this->api('POST', '/orders', [
            'shipping_address' => 'Adresse test',
            'payment_method' => 'card',
            'coupon_code' => 'TEST10',
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('orders', [
            'total_price' => 90,
            'coupon_code' => 'TEST10',
            'discount' => 10,
        ]);
    }

    public function test_checkout_fails_when_stock_insufficient(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create(['price' => 50, 'stock' => 1]);

        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 3]);

        $response = $this->api('POST', '/orders', [
            'shipping_address' => 'Adresse test',
            'payment_method' => 'card',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['stock']);
    }
}
