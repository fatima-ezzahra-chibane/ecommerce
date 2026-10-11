<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_wishlist(): void
    {
        $response = $this->api('GET', '/wishlist');

        $response->assertUnauthorized();
    }

    public function test_user_can_add_product_to_wishlist(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $response = $this->api('POST', '/wishlist', [
            'product_id' => $product->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Ajouté aux favoris.');

        $this->assertDatabaseHas('wishlists', [
            'product_id' => $product->id,
        ]);
    }

    public function test_user_can_remove_product_from_wishlist(): void
    {
        $user = $this->actingAsUser();
        $product = Product::factory()->create();

        $this->api('POST', '/wishlist', ['product_id' => $product->id]);

        $response = $this->api('DELETE', "/wishlist/{$product->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Retiré des favoris.');

        $this->assertDatabaseMissing('wishlists', [
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);
    }

    public function test_inactive_product_cannot_be_added_and_is_hidden_from_wishlist(): void
    {
        $user = $this->actingAsUser();
        $inactive = Product::factory()->create(['status' => 'inactive']);

        $this->api('POST', '/wishlist', ['product_id' => $inactive->id])
            ->assertUnprocessable()
            ->assertJsonPath('errors.product_id.0', 'Ce produit n\'est pas disponible.');

        $active = Product::factory()->create();
        $later = Product::factory()->create();
        $this->api('POST', '/wishlist', ['product_id' => $active->id])->assertCreated();
        $this->api('POST', '/wishlist', ['product_id' => $later->id])->assertCreated();
        $later->update(['status' => 'inactive']);

        $this->api('GET', '/wishlist')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.product.id', $active->id);
        $this->assertDatabaseHas('wishlists', ['user_id' => $user->id, 'product_id' => $later->id]);
    }
}
