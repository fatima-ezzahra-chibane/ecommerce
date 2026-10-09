<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('user_id')
                ->constrained('coupons')->nullOnDelete();
        });

        DB::table('orders')->whereNotNull('coupon_code')->update([
            'coupon_id' => DB::raw('(SELECT id FROM coupons WHERE coupons.code = orders.coupon_code)'),
        ]);
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('coupon_id');
        });
    }
};
