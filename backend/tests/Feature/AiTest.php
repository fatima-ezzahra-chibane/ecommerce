<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
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
            ->assertJsonPath('data.features.chatbot', true)
            ->assertJsonPath('data.features.recommendations', true);
    }

    public function test_chatbot_local_reply_without_openai(): void
    {
        $response = $this->postJson('/api/v1/ai/chat', [
            'message' => 'Quels sont les délais de livraison ?',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.source', 'local')
            ->assertJsonStructure(['data' => ['reply', 'products', 'source']]);
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

    public function test_personalized_recommendations_for_user(): void
    {
        $user = User::factory()->create();
        Product::factory()->count(3)->create(['status' => 'active']);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/ai/recommendations');

        $response->assertOk()
            ->assertJsonStructure(['data']);
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
            ->assertJsonPath('data.source', 'opencv_orb');
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
}
