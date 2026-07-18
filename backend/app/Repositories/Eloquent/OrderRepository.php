<?php

namespace App\Repositories\Eloquent;

use App\Models\Order;
use App\Models\User;
use App\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    public function paginateByUser(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return Order::where('user_id', $user->id)
            ->with(['items.product', 'payment'])
            ->latest()
            ->paginate($perPage);
    }

    public function paginateAll(int $perPage = 15): LengthAwarePaginator
    {
        return Order::with(['user', 'items.product', 'payment'])
            ->latest()
            ->paginate($perPage);
    }

    public function findById(int $id): ?Order
    {
        return Order::with(['items.product', 'payment'])->find($id);
    }

    public function create(array $data): Order
    {
        return Order::create($data);
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $order->fresh(['items.product', 'payment']);
    }
}
