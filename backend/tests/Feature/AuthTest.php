<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->api('POST', '/register', [
            'name' => 'Nouveau Client',
            'email' => 'client@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '0600000000',
        ]);

        $response->assertCreated()
            ->assertJsonPath('message', 'Inscription réussie.')
            ->assertJsonStructure(['user' => ['id', 'name', 'email', 'role'], 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'client@test.com',
            'role' => 'user',
        ]);
    }

    public function test_register_requires_valid_data(): void
    {
        $response = $this->api('POST', '/register', [
            'name' => '',
            'email' => 'invalid-email',
            'password' => '123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $this->createUser('user', ['email' => 'login@test.com']);

        $response = $this->api('POST', '/login', [
            'email' => 'login@test.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Connexion réussie.')
            ->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->createUser('user', ['email' => 'wrong@test.com']);

        $response = $this->api('POST', '/login', [
            'email' => 'wrong@test.com',
            'password' => 'bad-password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->createUser('user', [
            'email' => 'inactive@test.com',
            'is_active' => false,
        ]);

        $response = $this->api('POST', '/login', [
            'email' => 'inactive@test.com',
            'password' => 'password',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = $this->actingAsUser();

        $response = $this->api('GET', '/me');

        $response->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', $user->email);
    }

    public function test_guest_cannot_access_protected_routes(): void
    {
        $response = $this->api('GET', '/me');

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Non authentifié. Veuillez vous connecter.');
    }

    public function test_user_can_logout(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/logout', [], ['Accept' => 'application/json']);

        $response->assertOk()
            ->assertJsonPath('message', 'Déconnexion réussie.');

        $this->assertSame(0, $user->fresh()->tokens()->count());
    }
}
