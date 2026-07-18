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
        return response()->json(['data' => Coupon::latest()->get()]);
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Coupon créé.',
            'data' => Coupon::create($request->validated()),
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        Coupon::findOrFail($id)->delete();

        return response()->json(['message' => 'Coupon supprimé.']);
    }
}
