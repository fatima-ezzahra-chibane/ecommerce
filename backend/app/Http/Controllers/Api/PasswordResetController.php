<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function forgot(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );
            try {
                $user->notify(new ResetPasswordNotification($token));
            } catch (\Throwable) {
                // L'email peut échouer en dev (permissions logs) — le lien debug reste disponible
            }
        }

        $payload = [
            'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.',
        ];

        if (config('app.debug') && $user && isset($token)) {
            $frontend = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/');
            $payload['reset_url'] = $frontend.'/reset-password?token='.$token.'&email='.urlencode($user->email);
        }

        return response()->json($payload);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (! $record || ! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Lien invalide ou expiré.'], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            return response()->json(['message' => 'Le lien a expiré.'], 422);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update(['password' => $request->password]);
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe mis à jour. Vous pouvez vous connecter.']);
    }
}
