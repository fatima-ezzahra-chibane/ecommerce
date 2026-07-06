<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $this->actingAsUser(role: 'user');

        $response = $this->api('GET', '/admin/dashboard');

        $response->assertForbidden()
            ->assertJsonPath('message', 'Accès refusé. Admin requis.');
    }

    public function test_admin_can_access_dashboard(): void
    {
        $this->actingAsUser(role: 'admin');

        $response = $this->api('GET', '/admin/dashboard');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'products_count',
                    'users_count',
                    'orders_count',
                    'revenue',
                    'orders_by_status',
                    'monthly_sales',
                ],
            ]);
    }

    public function test_guest_cannot_access_admin_routes(): void
    {
        $response = $this->api('GET', '/admin/products');

        $response->assertUnauthorized();
    }
}
