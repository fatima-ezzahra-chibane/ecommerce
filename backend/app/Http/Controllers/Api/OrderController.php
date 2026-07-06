<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->userOrders($request->user());

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'shipping_address' => 'required|string|max:1000',
            'payment_method' => 'required|string|in:card,paypal,cash',
            'coupon_code' => 'nullable|string|exists:coupons,code',
        ]);

        $order = $this->orderService->checkout($request->user(), $validated);

        return response()->json([
            'message' => 'Commande passée avec succès.',
            'data' => new OrderResource($order),
        ], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.product', 'payment'])
            ->findOrFail($id);

        return response()->json(['data' => new OrderResource($order)]);
    }
}
