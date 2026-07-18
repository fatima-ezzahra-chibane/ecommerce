<?php

namespace App\Repositories\Contracts;

use App\Models\Order;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function paginateByUser(User $user, int $perPage = 10): LengthAwarePaginator;

    public function paginateAll(int $perPage = 15): LengthAwarePaginator;

    public function findById(int $id): ?Order;

    public function create(array $data): Order;

    public function updateStatus(Order $order, string $status): Order;
}
