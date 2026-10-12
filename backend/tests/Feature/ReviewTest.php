<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Review;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_reviews_are_public(): void
    {
        $product = Product::factory()->create();
        $user = $this->createUser();
        Review::create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 4, 'comment' => 'Bien']);

        $this->api('GET', "/products/{$product->id}/reviews")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.rating', 4)
            ->assertJsonPath('data.0.user.name', $user->name);
    }

    public function test_guest_cannot_post_review(): void
    {
        $product = Product::factory()->create();

        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 5])->assertUnauthorized();
    }

    public function test_user_can_post_review_with_image(): void
    {
        Storage::fake('public');
        $this->actingAsUser();
        $product = Product::factory()->create();

        $this->post("/api/v1/products/{$product->id}/reviews", [
            'rating' => 5,
            'comment' => 'Excellent',
            'image' => UploadedFile::fake()->image('avis.jpg'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.rating', 5);

        $review = Review::first();
        $this->assertStringStartsWith('/storage/reviews/', $review->image);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $review->image));
    }

    public function test_updating_review_without_new_image_keeps_existing_image(): void
    {
        Storage::fake('public');
        $this->actingAsUser();
        $product = Product::factory()->create();

        $this->post("/api/v1/products/{$product->id}/reviews", [
            'rating' => 3,
            'image' => UploadedFile::fake()->image('avis.jpg'),
        ], ['Accept' => 'application/json'])->assertCreated();
        $image = Review::first()->image;

        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 5])->assertCreated();

        $this->assertSame($image, Review::first()->image);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $image));
    }

    public function test_review_rating_must_be_between_1_and_5(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 6])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['rating']);
    }

    public function test_posting_again_updates_the_same_review(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create();

        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 2])->assertCreated();
        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 5])->assertCreated();

        $this->assertDatabaseCount('reviews', 1);
        $this->assertDatabaseHas('reviews', ['product_id' => $product->id, 'rating' => 5]);
    }

    public function test_cannot_review_inactive_product(): void
    {
        $this->actingAsUser();
        $product = Product::factory()->create(['status' => 'inactive']);

        $this->api('POST', "/products/{$product->id}/reviews", ['rating' => 5])->assertNotFound();
    }

    public function test_user_can_delete_own_review(): void
    {
        $user = $this->actingAsUser();
        $product = Product::factory()->create();
        Review::create(['user_id' => $user->id, 'product_id' => $product->id, 'rating' => 3]);

        $this->api('DELETE', "/products/{$product->id}/reviews")->assertOk();

        $this->assertDatabaseCount('reviews', 0);
    }

    public function test_user_cannot_delete_someone_else_review(): void
    {
        $product = Product::factory()->create();
        $other = $this->createUser();
        Review::create(['user_id' => $other->id, 'product_id' => $product->id, 'rating' => 3]);

        $this->actingAsUser();
        $this->api('DELETE', "/products/{$product->id}/reviews")->assertOk();

        $this->assertDatabaseCount('reviews', 1);
    }
}
