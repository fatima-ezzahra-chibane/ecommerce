<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->actingAsUser(role: 'admin');
    }

    // ---- Accès ----

    public function test_regular_user_is_forbidden_on_every_admin_route(): void
    {
        $this->actingAsUser(role: 'user');

        foreach ([
            ['GET', '/admin/products'], ['POST', '/admin/products'], ['PUT', '/admin/products/1'],
            ['DELETE', '/admin/products/1'], ['POST', '/admin/products/1/image'],
            ['GET', '/admin/categories'], ['POST', '/admin/categories'], ['PUT', '/admin/categories/1'],
            ['DELETE', '/admin/categories/1'], ['GET', '/admin/orders'], ['PATCH', '/admin/orders/1/status'],
            ['GET', '/admin/users'], ['PATCH', '/admin/users/1/toggle'],
            ['GET', '/admin/coupons'], ['POST', '/admin/coupons'], ['DELETE', '/admin/coupons/1'],
        ] as [$method, $uri]) {
            $this->api($method, $uri)->assertForbidden();
        }
    }

    // ---- Produits ----

    public function test_admin_lists_all_products_including_inactive(): void
    {
        Product::factory()->create(['status' => 'active']);
        Product::factory()->create(['status' => 'inactive']);

        $this->api('GET', '/admin/products')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.total', 2);
    }

    public function test_admin_creates_product(): void
    {
        $category = Category::factory()->create();

        $this->api('POST', '/admin/products', [
            'category_id' => $category->id,
            'name' => 'Lampe design',
            'price' => 250,
            'original_price' => 300,
            'stock' => 7,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Lampe design')
            ->assertJsonPath('data.status', 'active');

        $this->assertDatabaseHas('products', ['name' => 'Lampe design', 'stock' => 7]);
    }

    public function test_product_creation_is_validated(): void
    {
        $this->api('POST', '/admin/products', ['price' => -1])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'name', 'price', 'stock']);
    }

    public function test_admin_updates_product(): void
    {
        $product = Product::factory()->create(['price' => 100]);

        $this->api('PUT', "/admin/products/{$product->id}", ['price' => 80, 'status' => 'inactive'])
            ->assertOk()
            ->assertJsonPath('data.status', 'inactive');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'price' => 80, 'status' => 'inactive']);
    }

    public function test_admin_uploads_product_image_and_indexes_it(): void
    {
        Storage::fake('public');
        Http::fake(['cv-service:8090/*' => Http::response(['status' => 'ok'], 200)]);
        $product = Product::factory()->create(['status' => 'active']);

        $response = $this->post("/api/v1/admin/products/{$product->id}/image", [
            'image' => UploadedFile::fake()->image('produit.png'),
        ], ['Accept' => 'application/json'])->assertOk();

        $path = $product->fresh()->image;
        $this->assertStringStartsWith('/storage/products/', $path);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $path));
        Http::assertSent(fn ($request) => str_ends_with($request->url(), '/index/url'));
        $this->assertNotNull($response->json('data.image'));
    }

    public function test_product_image_must_be_an_image(): void
    {
        $product = Product::factory()->create();

        $this->post("/api/v1/admin/products/{$product->id}/image", [
            'image' => UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable();
    }

    // ---- Catégories ----

    public function test_admin_manages_categories(): void
    {
        $id = $this->api('POST', '/admin/categories', ['name' => 'Maison Déco'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'maison-deco')
            ->json('data.id');

        $this->api('PUT', "/admin/categories/{$id}", ['name' => 'Maison'])
            ->assertOk()
            ->assertJsonPath('data.slug', 'maison');

        $this->api('GET', '/admin/categories')->assertOk()->assertJsonPath('data.0.products_count', 0);

        $this->api('DELETE', "/admin/categories/{$id}")->assertOk();
        $this->assertDatabaseMissing('categories', ['id' => $id]);
    }

    public function test_category_name_is_required(): void
    {
        $this->api('POST', '/admin/categories', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    // ---- Commandes ----

    public function test_admin_lists_all_orders_and_updates_status(): void
    {
        $order = Order::create([
            'user_id' => $this->createUser()->id,
            'total_price' => 100,
            'shipping_address' => 'Adresse',
        ]);

        $this->api('GET', '/admin/orders')->assertOk()->assertJsonPath('meta.total', 1);

        $this->api('PATCH', "/admin/orders/{$order->id}/status", ['status' => 'shipped'])
            ->assertOk()
            ->assertJsonPath('data.status', 'shipped');

        $this->api('PATCH', "/admin/orders/{$order->id}/status", ['status' => 'perdue'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    // ---- Utilisateurs ----

    public function test_admin_lists_users_and_toggles_activation(): void
    {
        $client = $this->createUser(attributes: ['password' => 'password']);
        $client->createToken('auth-token');

        $this->api('GET', '/admin/users')->assertOk()->assertJsonPath('meta.total', 2);

        $this->api('PATCH', "/admin/users/{$client->id}/toggle")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->assertSame(0, $client->tokens()->count(), 'Les sessions du compte désactivé doivent être révoquées.');

        Auth::shouldUse('web');
        $this->api('POST', '/login', ['email' => $client->email, 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Compte désactivé.');

        $this->actingAsUser(role: 'admin');
        $this->api('PATCH', "/admin/users/{$client->id}/toggle")
            ->assertOk()
            ->assertJsonPath('data.is_active', true);
    }

    // ---- Coupons ----

    public function test_deleting_coupon_keeps_order_history(): void
    {
        $coupon = Coupon::create(['code' => 'BYE', 'discount' => 10, 'type' => 'fixed', 'is_active' => true]);
        $order = Order::create([
            'user_id' => $this->createUser()->id,
            'coupon_id' => $coupon->id,
            'coupon_code' => 'BYE',
            'discount' => 10,
            'total_price' => 90,
            'shipping_address' => 'Adresse',
        ]);

        $this->api('DELETE', "/admin/coupons/{$coupon->id}")->assertOk();

        $this->assertDatabaseMissing('coupons', ['id' => $coupon->id]);
        $this->assertDatabaseHas('orders', ['id' => $order->id, 'coupon_id' => null, 'coupon_code' => 'BYE', 'discount' => 10]);
    }

    // ---- Tableau de bord ----

    public function test_dashboard_revenue_ignores_pending_and_cancelled_orders(): void
    {
        $userId = $this->createUser()->id;
        foreach (['pending' => 10, 'processing' => 100, 'shipped' => 200, 'delivered' => 300, 'cancelled' => 1000] as $status => $total) {
            Order::create(['user_id' => $userId, 'total_price' => $total, 'status' => $status, 'shipping_address' => 'A']);
        }

        $this->api('GET', '/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.orders_count', 5)
            ->assertJsonPath('data.users_count', 1)
            ->assertJsonPath('data.orders_by_status.cancelled', 1);

        $data = $this->api('GET', '/admin/dashboard')->json('data');
        $this->assertEquals(600, (float) $data['revenue']);
        $this->assertEquals(600, (float) collect($data['monthly_sales'])->sum('total'), 'Le graphique doit utiliser les mêmes commandes que le CA.');
    }
}
