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
            'discount' => 'required|numeric|min:0',
            'type' => 'required|in:fixed,percent',
            'expiration_date' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Le code du coupon est requis.',
            'code.unique' => 'Ce code de coupon existe déjà.',
            'discount.required' => 'Le montant de réduction est requis.',
            'discount.min' => 'La réduction ne peut pas être négative.',
            'type.required' => 'Le type de coupon est requis.',
            'type.in' => 'Le type doit être "fixed" ou "percent".',
        ];
    }
}
