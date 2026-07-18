<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'shipping_address' => 'required|string|max:1000',
            'payment_method' => 'required|string|in:card,paypal,cash',
            'coupon_code' => 'nullable|string|exists:coupons,code',
        ];
    }

    public function messages(): array
    {
        return [
            'shipping_address.required' => 'L\'adresse de livraison est requise.',
            'shipping_address.max' => 'L\'adresse ne peut pas dépasser 1000 caractères.',
            'payment_method.required' => 'La méthode de paiement est requise.',
            'payment_method.in' => 'Méthode de paiement invalide (carte, PayPal ou espèces).',
            'coupon_code.exists' => 'Ce code promo n\'existe pas.',
        ];
    }
}
