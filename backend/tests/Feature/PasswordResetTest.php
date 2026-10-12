<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function storeToken(string $email, string $token, $createdAt = null): void
    {
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => $createdAt ?? now(),
        ]);
    }

    public function test_forgot_password_gives_same_message_for_unknown_email(): void
    {
        $this->api('POST', '/forgot-password', ['email' => 'inconnu@test.com'])
            ->assertOk()
            ->assertJsonPath('message', 'Si cet email existe, un lien de réinitialisation a été envoyé.');

        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_forgot_password_creates_token_and_notifies(): void
    {
        Notification::fake();
        $user = $this->createUser();

        $this->api('POST', '/forgot-password', ['email' => $user->email])->assertOk();

        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
        Notification::assertSentTo($user, \App\Notifications\ResetPasswordNotification::class);
    }

    public function test_user_can_reset_password_with_valid_token(): void
    {
        $user = $this->createUser();
        $user->createToken('ancienne-session');
        $this->storeToken($user->email, 'jeton-valide');

        $this->api('POST', '/reset-password', [
            'email' => $user->email,
            'token' => 'jeton-valide',
            'password' => 'nouveauMDP1',
            'password_confirmation' => 'nouveauMDP1',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveauMDP1', $user->fresh()->password));
        $this->assertDatabaseCount('password_reset_tokens', 0);
        $this->assertSame(0, $user->tokens()->count(), 'Les sessions existantes doivent être révoquées.');
    }

    public function test_reset_fails_with_wrong_token(): void
    {
        $user = $this->createUser();
        $this->storeToken($user->email, 'jeton-valide');

        $this->api('POST', '/reset-password', [
            'email' => $user->email,
            'token' => 'faux',
            'password' => 'nouveauMDP1',
            'password_confirmation' => 'nouveauMDP1',
        ])->assertUnprocessable()->assertJsonPath('message', 'Lien invalide ou expiré.');
    }

    public function test_reset_fails_when_token_older_than_60_minutes(): void
    {
        $user = $this->createUser();
        $this->storeToken($user->email, 'jeton-ancien', now()->subMinutes(61));

        $this->api('POST', '/reset-password', [
            'email' => $user->email,
            'token' => 'jeton-ancien',
            'password' => 'nouveauMDP1',
            'password_confirmation' => 'nouveauMDP1',
        ])->assertUnprocessable()->assertJsonPath('message', 'Le lien a expiré.');
    }
}
