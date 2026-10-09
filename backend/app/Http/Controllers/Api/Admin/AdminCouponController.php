<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCouponRequest;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;

class AdminCouponController extends Controller
{
    public function index(): JsonResponse
    {
        $coupons = Coupon::withCount(['orders as used_count' => fn ($q) => $q->where('status', '!=', 'cancelled')])
            ->latest()
            ->get();

        return response()->json(['data' => $coupons]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['min_order_amount'] = $validated['min_order_amount'] ?? 0;

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
