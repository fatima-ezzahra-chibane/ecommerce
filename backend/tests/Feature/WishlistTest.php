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
}
