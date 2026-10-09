<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DataIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private function orderProduct(Product $product): void
    {
        $this->actingAsUser();
        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->api('POST', '/orders', ['shipping_address' => 'Adresse test', 'payment_method' => 'card'])->assertCreated();
    }

    public function test_deleting_ordered_product_deactivates_it(): void
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $this->orderProduct($product);

        $this->actingAsUser(role: 'admin');
        $this->api('DELETE', "/admin/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'status' => 'inactive']);
        $this->assertDatabaseHas('order_items', ['product_id' => $product->id]);
    }

    public function test_deleting_never_ordered_product_removes_it(): void
    {
        $product = Product::factory()->create();

        $this->actingAsUser(role: 'admin');
        $this->api('DELETE', "/admin/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('message', 'Produit supprimé.');

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    public function test_database_refuses_deleting_ordered_product(): void
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $this->orderProduct($product);

        $this->expectException(QueryException::class);
        $product->delete();
    }

    public function test_cannot_delete_category_with_ordered_products(): void
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $this->orderProduct($product);

        $this->actingAsUser(role: 'admin');
        $this->api('DELETE', "/admin/categories/{$product->category_id}")
            ->assertUnprocessable();

        $this->assertDatabaseHas('categories', ['id' => $product->category_id]);
    }

    public function test_checkout_rejects_inactive_product_in_cart(): void
    {
        $product = Product::factory()->create(['price' => 100, 'stock' => 5]);
        $this->actingAsUser();
        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);

        $product->update(['status' => 'inactive']);

        $this->api('POST', '/orders', ['shipping_address' => 'Adresse test', 'payment_method' => 'card'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cart']);
    }

    public function test_user_has_a_single_cart(): void
    {
        $user = $this->actingAsUser();
        $a = Product::factory()->create();
        $b = Product::factory()->create();

        $this->api('POST', '/cart', ['product_id' => $a->id]);
        $this->api('POST', '/cart', ['product_id' => $b->id]);
        $this->api('GET', '/cart')->assertOk();

        $this->assertSame(1, Cart::where('user_id', $user->id)->count());

        $this->expectException(QueryException::class);
        Cart::create(['user_id' => $user->id]);
    }

    public function test_admin_cannot_create_percent_coupon_over_100(): void
    {
        $this->actingAsUser(role: 'admin');

        $this->api('POST', '/admin/coupons', [
            'code' => 'TOOMUCH',
            'discount' => 150,
            'type' => 'percent',
        ])->assertUnprocessable()->assertJsonValidationErrors(['discount']);
    }

    public function test_admin_can_create_coupon_with_usage_rules(): void
    {
        $this->actingAsUser(role: 'admin');

        $this->api('POST', '/admin/coupons', [
            'code' => 'VIP',
            'discount' => 15,
            'type' => 'percent',
            'usage_limit' => 100,
            'min_order_amount' => 300,
        ])->assertCreated();

        $this->assertDatabaseHas('coupons', ['code' => 'VIP', 'usage_limit' => 100, 'min_order_amount' => 300]);
        $this->api('GET', '/admin/coupons')->assertOk()->assertJsonPath('data.0.used_count', 0);
    }
}
