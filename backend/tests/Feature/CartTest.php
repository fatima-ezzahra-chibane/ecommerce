<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_cart(): void
    {
        $response = $this->api('GET', '/cart');

        $response->assertUnauthorized();
    }

    public function test_user_can_add_product_to_cart(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $response = $this->api('POST', '/cart', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Produit ajouté au panier.');

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
    }

    public function test_adding_same_product_increments_quantity(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 2]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $product->id,
            'quantity' => 3,
        ]);
    }

    public function test_user_can_update_cart_item_quantity(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $add = $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $itemId = $add->json('data.items.0.id');

        $response = $this->api('PUT', "/cart/{$itemId}", ['quantity' => 5]);

        $response->assertOk()
            ->assertJsonPath('message', 'Panier mis à jour.');

        $this->assertDatabaseHas('cart_items', [
            'id' => $itemId,
            'quantity' => 5,
        ]);
    }

    public function test_user_can_remove_cart_item(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $add = $this->api('POST', '/cart', ['product_id' => $product->id, 'quantity' => 1]);
        $itemId = $add->json('data.items.0.id');

        $response = $this->api('DELETE', "/cart/{$itemId}");

        $response->assertOk()
            ->assertJsonPath('message', 'Article supprimé.');

        $this->assertDatabaseMissing('cart_items', ['id' => $itemId]);
    }
}
