<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    public function test_health_endpoint_is_available(): void
    {
        $response = $this->get('/up');

        $response->assertOk();
    }

    public function test_api_root_returns_json(): void
    {
        $response = $this->get('/');

        $response->assertOk()
            ->assertJsonStructure(['name', 'version']);
    }

    public function test_public_products_endpoint_returns_json(): void
    {
        $response = $this->api('GET', '/products');

        $response->assertOk()
            ->assertJsonStructure(['data', 'meta']);
    }
}
