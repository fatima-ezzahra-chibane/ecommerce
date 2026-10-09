<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => 'required|string|unique:coupons,code',
            'discount' => array_filter([
                'required', 'numeric', 'gt:0',
                $this->input('type') === 'percent' ? 'max:100' : null,
            ]),
            'type' => 'required|in:fixed,percent',
            'usage_limit' => 'nullable|integer|min:1',
            'min_order_amount' => 'nullable|numeric|min:0',
            'expiration_date' => 'nullable|date|after_or_equal:today',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code du coupon est requis.',
            'code.unique' => 'Ce code de coupon existe déjà.',
            'discount.required' => 'Le montant de réduction est requis.',
            'discount.gt' => 'La réduction doit être supérieure à 0.',
            'discount.max' => 'Une réduction en pourcentage ne peut pas dépasser 100 %.',
            'type.required' => 'Le type de coupon est requis.',
            'type.in' => 'Le type doit être "fixed" ou "percent".',
            'usage_limit.min' => 'La limite d\'utilisation doit être d\'au moins 1.',
            'min_order_amount.min' => 'Le montant minimum ne peut pas être négatif.',
            'expiration_date.after_or_equal' => 'La date d\'expiration ne peut pas être dans le passé.',
        ];
    }
}
