<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'status' => 'in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'La catégorie est requise.',
            'category_id.exists' => 'Cette catégorie n\'existe pas.',
            'name.required' => 'Le nom du produit est requis.',
            'price.required' => 'Le prix est requis.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'original_price.min' => 'Le prix original ne peut pas être négatif.',
            'stock.required' => 'Le stock est requis.',
            'stock.min' => 'Le stock ne peut pas être négatif.',
        ];
    }
}
