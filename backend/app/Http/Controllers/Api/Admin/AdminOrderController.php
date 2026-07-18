<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Http\JsonResponse;

class AdminOrderController extends Controller
{
    public function __construct(private OrderRepositoryInterface $orders) {}

    public function index(): JsonResponse
    {
        $orders = $this->orders->paginateAll();

        return response()->json([
            'data' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, int $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $updated = $this->orders->updateStatus($order, $request->validated()['status']);

        return response()->json([
            'message' => 'Statut de la commande mis à jour.',
            'data' => new OrderResource($updated),
        ]);
    }
}
