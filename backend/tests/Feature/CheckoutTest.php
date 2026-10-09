<?php

namespace Tests\Feature;

use App\Models\Coupon;
use App\Models\Order;
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

    public function test_order_keeps_product_name_and_coupon_link(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create(['name' => 'Robe été', 'price' => 200, 'stock' => 5]);
        $coupon = Coupon::create(['code' => 'FIX50', 'discount' => 50, 'type' => 'fixed', 'is_active' => true]);

        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->api('POST', '/orders', [
            'shipping_address' => 'Adresse test',
            'payment_method' => 'card',
            'coupon_code' => 'FIX50',
        ])->assertCreated();

        $product->update(['name' => 'Nouveau nom', 'price' => 999]);

        $this->assertDatabaseHas('orders', [
            'coupon_id' => $coupon->id,
            'coupon_code' => 'FIX50',
            'discount' => 50,
            'total_price' => 150,
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'product_name' => 'Robe été',
            'price' => 200,
        ]);
    }

    public function test_checkout_rejects_unknown_coupon(): void
    {
        $this->checkoutWithCoupon('INCONNU', 100)
            ->assertUnprocessable()
            ->assertJsonPath('errors.coupon_code.0', "Ce code promo n'existe pas.");
    }

    public function test_checkout_rejects_expired_coupon(): void
    {
        Coupon::create([
            'code' => 'OLD', 'discount' => 10, 'type' => 'percent',
            'is_active' => true, 'expiration_date' => now()->subDay(),
        ]);

        $this->checkoutWithCoupon('OLD', 100)
            ->assertUnprocessable()
            ->assertJsonPath('errors.coupon_code.0', 'Ce code promo a expiré.');
    }

    public function test_checkout_rejects_coupon_when_usage_limit_reached(): void
    {
        $coupon = Coupon::create([
            'code' => 'ONCE', 'discount' => 10, 'type' => 'percent',
            'is_active' => true, 'usage_limit' => 1,
        ]);
        Order::create([
            'user_id' => $this->createUser()->id,
            'coupon_id' => $coupon->id,
            'coupon_code' => 'ONCE',
            'total_price' => 90,
            'discount' => 10,
            'shipping_address' => 'Adresse',
        ]);

        $this->checkoutWithCoupon('ONCE', 100)
            ->assertUnprocessable()
            ->assertJsonPath('errors.coupon_code.0', "Ce code promo a atteint sa limite d'utilisation.");
    }

    public function test_checkout_rejects_coupon_below_min_order_amount(): void
    {
        Coupon::create([
            'code' => 'BIG', 'discount' => 20, 'type' => 'fixed',
            'is_active' => true, 'min_order_amount' => 500,
        ]);

        $this->checkoutWithCoupon('BIG', 100)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['coupon_code']);

        $this->assertDatabaseCount('orders', 0);
    }

    private function checkoutWithCoupon(string $code, float $price)
    {
        $this->actingAsUser();
        $product = Product::factory()->create(['price' => $price, 'stock' => 5]);
        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);

        return $this->api('POST', '/orders', [
            'shipping_address' => 'Adresse test',
            'payment_method' => 'card',
            'coupon_code' => $code,
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
