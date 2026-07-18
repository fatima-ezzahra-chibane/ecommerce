<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'image' => 'nullable|string',
            'status' => 'in:active,inactive',
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.exists' => 'Cette catégorie n\'existe pas.',
            'name.max' => 'Le nom ne peut pas dépasser 255 caractères.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'original_price.min' => 'Le prix original ne peut pas être négatif.',
            'stock.min' => 'Le stock ne peut pas être négatif.',
        ];
    }
}
