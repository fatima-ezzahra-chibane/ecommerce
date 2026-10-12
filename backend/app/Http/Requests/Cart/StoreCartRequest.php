<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', Rule::exists('products', 'id')->where('status', 'active')],
            'quantity' => 'integer|min:1|max:99',
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'Le produit est requis.',
            'product_id.exists' => 'Ce produit n\'est pas disponible.',
            'quantity.min' => 'La quantité doit être d\'au moins 1.',
            'quantity.max' => 'La quantité ne peut pas dépasser 99.',
        ];
    }
}
