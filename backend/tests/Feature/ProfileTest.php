<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile(): void
    {
        $user = $this->actingAsUser();

        $this->api('PUT', '/profile', ['name' => 'Nouveau Nom', 'phone' => '0600000000'])
            ->assertOk()
            ->assertJsonPath('user.name', 'Nouveau Nom')
            ->assertJsonPath('user.phone', '0600000000');

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'Nouveau Nom']);
    }

    public function test_profile_update_cannot_change_role(): void
    {
        $user = $this->actingAsUser();

        $this->api('PUT', '/profile', ['name' => 'X', 'role' => 'admin'])->assertOk();

        $this->assertSame('user', $user->fresh()->role);
    }

    public function test_password_change_requires_current_password(): void
    {
        $this->actingAsUser($this->createUser(attributes: ['password' => Hash::make('ancienMDP1')]));

        $this->api('PUT', '/profile/password', [
            'current_password' => 'mauvais',
            'password' => 'nouveauMDP1',
            'password_confirmation' => 'nouveauMDP1',
        ])->assertUnprocessable();
    }

    public function test_user_can_change_password(): void
    {
        $user = $this->actingAsUser($this->createUser(attributes: ['password' => Hash::make('ancienMDP1')]));

        $this->api('PUT', '/profile/password', [
            'current_password' => 'ancienMDP1',
            'password' => 'nouveauMDP1',
            'password_confirmation' => 'nouveauMDP1',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveauMDP1', $user->fresh()->password));
    }

    public function test_guest_cannot_update_profile(): void
    {
        $this->api('PUT', '/profile', ['name' => 'X'])->assertUnauthorized();
    }
}
