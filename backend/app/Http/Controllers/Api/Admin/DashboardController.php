<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // Chiffre d'affaires = paiements encaissés (carte/PayPal à la commande, espèces à la livraison, hors remboursements)
        $completedPayments = Payment::where('status', 'completed');

        $monthlySales = (clone $completedPayments)
            ->whereYear('created_at', (int) date('Y'))
            ->get(['amount', 'created_at'])
            ->groupBy(fn (Payment $payment) => $payment->created_at->month)
            ->map(fn ($payments, $month) => [
                'month' => (int) $month,
                'total' => $payments->sum('amount'),
            ])
            ->values();

        return response()->json([
            'data' => [
                'products_count' => Product::count(),
                'users_count' => User::where('role', 'user')->count(),
                'orders_count' => Order::count(),
                'revenue' => $completedPayments->sum('amount'),
                'orders_by_status' => Order::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')->pluck('count', 'status'),
                'monthly_sales' => $monthlySales,
            ],
        ]);
    }
}
