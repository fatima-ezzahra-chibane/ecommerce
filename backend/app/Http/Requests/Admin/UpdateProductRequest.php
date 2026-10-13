<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

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

    /** Mise à jour partielle : le prix barré est comparé au prix envoyé ou, à défaut, au prix enregistré. */
    public function after(): array
    {
        return [function (Validator $validator) {
            if ($validator->errors()->hasAny(['price', 'original_price'])) {
                return;
            }

            $product = Product::find($this->route('product'));
            $price = $this->has('price') ? $this->input('price') : $product?->price;
            $original = $this->has('original_price') ? $this->input('original_price') : $product?->original_price;

            if ($original !== null && $price !== null && (float) $original <= (float) $price) {
                $field = $this->has('original_price') ? 'original_price' : 'price';
                $validator->errors()->add($field, 'Le prix barré doit être supérieur au prix de vente.');
            }
        }];
    }
}
