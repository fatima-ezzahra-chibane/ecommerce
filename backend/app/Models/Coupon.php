<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'discount', 'type', 'expiration_date', 'is_active'];

    protected function casts(): array
    {
        return [
            'discount' => 'decimal:2',
            'expiration_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }
        if ($this->expiration_date && $this->expiration_date->isPast()) {
            return false;
        }

        return true;
    }
}
