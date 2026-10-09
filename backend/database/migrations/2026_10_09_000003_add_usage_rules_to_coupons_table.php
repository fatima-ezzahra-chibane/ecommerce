<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            // NULL = utilisations illimitées
            $table->unsignedInteger('usage_limit')->nullable()->after('type');
            $table->decimal('min_order_amount', 10, 2)->default(0)->after('usage_limit');
        });
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['usage_limit', 'min_order_amount']);
        });
    }
};
