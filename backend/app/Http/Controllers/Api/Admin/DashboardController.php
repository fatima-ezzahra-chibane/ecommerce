<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        $revenue = Order::whereIn('status', ['delivered', 'shipped', 'processing'])->sum('total_price');

        $monthlySales = Order::whereYear('created_at', (int) date('Y'))
            ->get(['total_price', 'created_at'])
            ->groupBy(fn (Order $order) => $order->created_at->month)
            ->map(fn ($orders, $month) => [
                'month' => (int) $month,
                'total' => $orders->sum('total_price'),
            ])
            ->values();

        return response()->json([
            'data' => [
                'products_count' => Product::count(),
                'users_count' => User::where('role', 'user')->count(),
                'orders_count' => Order::count(),
                'revenue' => $revenue,
                'orders_by_status' => Order::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')->pluck('count', 'status'),
                'monthly_sales' => $monthlySales,
            ],
        ]);
    }
}
