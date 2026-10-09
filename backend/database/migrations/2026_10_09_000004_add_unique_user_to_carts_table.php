<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $userIds = DB::table('carts')
            ->select('user_id')
            ->groupBy('user_id')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            $cartIds = DB::table('carts')->where('user_id', $userId)->orderBy('id')->pluck('id');
            $keepId = $cartIds->shift();

            foreach (DB::table('cart_items')->whereIn('cart_id', $cartIds)->get() as $item) {
                $existing = DB::table('cart_items')
                    ->where('cart_id', $keepId)
                    ->where('product_id', $item->product_id)
                    ->first();

                if ($existing) {
                    DB::table('cart_items')->where('id', $existing->id)
                        ->update(['quantity' => $existing->quantity + $item->quantity]);
                    DB::table('cart_items')->where('id', $item->id)->delete();
                } else {
                    DB::table('cart_items')->where('id', $item->id)->update(['cart_id' => $keepId]);
                }
            }

            DB::table('carts')->whereIn('id', $cartIds)->delete();
        }

        Schema::table('carts', function (Blueprint $table) {
            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id']);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
