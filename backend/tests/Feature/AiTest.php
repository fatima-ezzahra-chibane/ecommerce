<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Wishlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiTest extends TestCase
{
    use RefreshDatabase;

    public function test_ai_status_is_public(): void
    {
        Http::fake([
            'cv-service:8090/health' => Http::response(['status' => 'ok', 'indexed_products' => 6], 200),
        ]);

        $response = $this->getJson('/api/v1/ai/status');

        $response->assertOk()
            ->assertJsonPath('data.features.image_search', true)
            ->assertJsonPath('data.features.recommendations', true);
    }

    public function test_product_recommendations_returns_products(): void
    {
        $product = Product::factory()->create(['status' => 'active']);
        Product::factory()->count(2)->create([
            'status' => 'active',
            'category_id' => $product->category_id,
        ]);

        $response = $this->getJson("/api/v1/products/{$product->id}/recommendations");

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_personalized_recommendations_use_bearer_token_on_public_route(): void
    {
        $user = User::factory()->create();
        $favorite = Product::factory()->create();
        $sameCategory = Product::factory()->create(['category_id' => $favorite->category_id]);
        Product::factory()->count(3)->create();
        Wishlist::create(['user_id' => $user->id, 'product_id' => $favorite->id]);
        $token = $user->createToken('auth-token')->plainTextToken;

        $personal = $this->getJson('/api/v1/ai/recommendations', ['Authorization' => "Bearer {$token}"])
            ->assertOk()->json('data.*.id');
        sort($personal);
        $this->assertSame([$favorite->id, $sameCategory->id], $personal);

        $this->app['auth']->forgetGuards();
        $this->assertCount(5, $this->getJson('/api/v1/ai/recommendations')->assertOk()->json('data'));
    }

    public function test_recommendation_limit_is_clamped(): void
    {
        Product::factory()->count(3)->create();

        $this->getJson('/api/v1/ai/recommendations?limit=-5')->assertOk()->assertJsonCount(1, 'data');
    }

    public function test_image_search_requires_image(): void
    {
        $response = $this->postJson('/api/v1/ai/search-image', []);

        $response->assertStatus(422);
    }

    public function test_image_search_returns_empty_when_no_match(): void
    {
        Http::fake([
            'cv-service:8090/health' => Http::response(['status' => 'ok'], 200),
            'cv-service:8090/search' => Http::response([
                'product_id' => null,
                'match_count' => 3,
                'confidence' => 0.0,
            ], 200),
        ]);

        $product = Product::factory()->create(['status' => 'active']);

        $response = $this->postJson('/api/v1/ai/search-image', [
            'image' => \Illuminate\Http\UploadedFile::fake()->image('query.jpg', 200, 200),
        ]);

        $response->assertOk()
            ->assertJsonPath('data.product_id', null)
            ->assertJsonCount(0, 'data.products')
            ->assertJsonPath('data.source', 'mobilenetv2_onnx');
    }

    public function test_image_search_returns_single_product_on_match(): void
    {
        $product = Product::factory()->create(['status' => 'active']);

        Http::fake([
            'cv-service:8090/health' => Http::response(['status' => 'ok'], 200),
            'cv-service:8090/search' => Http::response([
                'product_id' => $product->id,
                'match_count' => 42,
                'confidence' => 0.88,
            ], 200),
        ]);

        $response = $this->postJson('/api/v1/ai/search-image', [
            'image' => \Illuminate\Http\UploadedFile::fake()->image('query.jpg', 200, 200),
        ]);

        $response->assertOk()
            ->assertJsonPath('data.product_id', $product->id)
            ->assertJsonCount(1, 'data.products')
            ->assertJsonPath('data.products.0.id', $product->id);
    }

    public function test_image_search_ignores_match_on_inactive_product(): void
    {
        $product = Product::factory()->create(['status' => 'inactive']);

        Http::fake([
            'cv-service:8090/health' => Http::response(['status' => 'ok'], 200),
            'cv-service:8090/search' => Http::response(['product_id' => $product->id, 'match_count' => 1, 'confidence' => 0.95], 200),
        ]);

        $this->postJson('/api/v1/ai/search-image', [
            'image' => \Illuminate\Http\UploadedFile::fake()->image('query.jpg', 200, 200),
        ])->assertOk()
            ->assertJsonPath('data.product_id', null)
            ->assertJsonCount(0, 'data.products');
    }

    public function test_image_search_returns_503_when_cv_service_is_down_or_fails(): void
    {
        $image = fn () => ['image' => \Illuminate\Http\UploadedFile::fake()->image('query.jpg', 200, 200)];

        Http::fake(['cv-service:8090/*' => Http::response(null, 500)]);
        $this->postJson('/api/v1/ai/search-image', $image())->assertStatus(503)->assertJsonPath('data.source', 'unavailable');

        Http::fake([
            'cv-service:8090/health' => Http::response(['status' => 'ok'], 200),
            'cv-service:8090/search' => Http::response(['detail' => 'boom'], 500),
        ]);
        $this->postJson('/api/v1/ai/search-image', $image())->assertStatus(503);
    }
}
