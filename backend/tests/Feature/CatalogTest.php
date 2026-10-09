<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_list_excludes_inactive_products(): void
    {
        $active = Product::factory()->create(['status' => 'active']);
        Product::factory()->create(['status' => 'inactive']);

        $this->api('GET', '/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id)
            ->assertJsonStructure(['data', 'meta' => ['current_page', 'last_page', 'per_page', 'total']]);
    }

    public function test_product_list_filters_by_search_category_and_price(): void
    {
        $shoes = Category::factory()->create();
        $bags = Category::factory()->create();
        $target = Product::factory()->create(['name' => 'Basket Runner', 'category_id' => $shoes->id, 'price' => 300]);
        Product::factory()->create(['name' => 'Basket Luxe', 'category_id' => $shoes->id, 'price' => 900]);
        Product::factory()->create(['name' => 'Sac Runner', 'category_id' => $bags->id, 'price' => 300]);

        $this->api('GET', "/products?search=Basket&category_id={$shoes->id}&min_price=100&max_price=500")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $target->id);
    }

    public function test_product_list_sorts_by_price(): void
    {
        Product::factory()->create(['price' => 50]);
        Product::factory()->create(['price' => 10]);
        Product::factory()->create(['price' => 30]);

        $asc = $this->api('GET', '/products?sort=price_asc')->assertOk()->json('data.*.price');
        $desc = $this->api('GET', '/products?sort=price_desc')->assertOk()->json('data.*.price');

        $this->assertEquals([10, 30, 50], array_map('floatval', $asc));
        $this->assertEquals([50, 30, 10], array_map('floatval', $desc));
    }

    public function test_product_list_respects_per_page(): void
    {
        Product::factory()->count(5)->create();

        $this->api('GET', '/products?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 5);
    }

    public function test_product_detail_returns_active_product(): void
    {
        $product = Product::factory()->create(['name' => 'Montre']);

        $this->api('GET', "/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', 'Montre');
    }

    public function test_product_detail_hides_inactive_or_missing_product(): void
    {
        $inactive = Product::factory()->create(['status' => 'inactive']);

        $this->api('GET', "/products/{$inactive->id}")->assertNotFound();
        $this->api('GET', '/products/999999')->assertNotFound();
    }

    public function test_categories_are_listed(): void
    {
        Category::factory()->count(3)->create();

        $this->api('GET', '/categories')
            ->assertOk()
            ->assertJsonCount(3, 'data');
    }
}
