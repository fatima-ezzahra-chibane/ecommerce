<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'discount', 'type', 'usage_limit', 'min_order_amount',
        'expiration_date', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'usage_limit' => 'integer',
            'expiration_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /** Les commandes annulées ne consomment pas d'utilisation. */
    public function usedCount(): int
    {
        return $this->orders()->where('status', '!=', 'cancelled')->count();
    }

    /** Retourne la raison du refus, ou null si le coupon est applicable. */
    public function rejectionReason(float $subtotal): ?string
    {
        if (! $this->is_active) {
            return "Ce code promo n'est plus actif.";
        }
        if ($this->expiration_date && $this->expiration_date->isPast()) {
            return 'Ce code promo a expiré.';
        }
        if ($this->discount <= 0 || ($this->type === 'percent' && $this->discount > 100)) {
            return "Ce code promo n'est pas valide.";
        }
        if ($this->usage_limit !== null && $this->usedCount() >= $this->usage_limit) {
            return "Ce code promo a atteint sa limite d'utilisation.";
        }
        if ($subtotal < (float) $this->min_order_amount) {
            return 'Montant minimum de commande pour ce code : '.number_format((float) $this->min_order_amount, 2).' DH.';
        }

        return null;
    }

    public function discountFor(float $subtotal): float
    {
        $discount = $this->type === 'percent'
            ? $subtotal * ((float) $this->discount / 100)
            : (float) $this->discount;

        return round(min($discount, $subtotal), 2);
    }
}
