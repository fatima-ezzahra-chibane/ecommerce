<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with(['user', 'items.product', 'payment'])->latest()->paginate(15);

        return response()->json(['data' => OrderResource::collection($orders)]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $validated = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ]);
        $order->update($validated);

        return response()->json([
            'message' => 'Statut de la commande mis à jour.',
            'data' => new OrderResource($order->load(['items.product', 'payment'])),
        ]);
    }
}
