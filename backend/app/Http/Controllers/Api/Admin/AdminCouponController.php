<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Coupon::latest()->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:coupons,code',
            'discount' => 'required|numeric|min:0',
            'type' => 'required|in:fixed,percent',
            'expiration_date' => 'nullable|date',
        ]);

        return response()->json([
            'message' => 'Coupon créé.',
            'data' => Coupon::create($validated),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();

        return response()->json(['message' => 'Coupon supprimé.']);
    }
}
