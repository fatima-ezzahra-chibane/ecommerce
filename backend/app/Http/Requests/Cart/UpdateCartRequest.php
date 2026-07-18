<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => 'required|integer|min:0|max:99',
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'La quantité est requise.',
            'quantity.min' => 'La quantité ne peut pas être négative.',
            'quantity.max' => 'La quantité ne peut pas dépasser 99.',
        ];
    }
}
