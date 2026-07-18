<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function createUser(string $role = 'user', array $attributes = []): User
    {
        $user = User::factory()->create($attributes);
        $user->forceFill([
            'role' => $role,
            'is_active' => $attributes['is_active'] ?? true,
        ])->save();

        return $user->fresh();
    }

    protected function actingAsUser(?User $user = null, string $role = 'user'): User
    {
        $user ??= $this->createUser($role);
        Sanctum::actingAs($user);

        return $user;
    }

    protected function api(string $method, string $uri, array $data = [], array $headers = [])
    {
        return $this->json($method, '/api/v1'.$uri, $data, array_merge([
            'Accept' => 'application/json',
        ], $headers));
    }
}
