<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminUserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::latest()->paginate(15);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->isAdmin()) {
            return response()->json(['message' => 'Un compte administrateur ne peut pas être désactivé.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        if (! $user->is_active) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $user->is_active ? 'Utilisateur activé.' : 'Utilisateur désactivé.',
            'data' => new UserResource($user),
        ]);
    }
}
