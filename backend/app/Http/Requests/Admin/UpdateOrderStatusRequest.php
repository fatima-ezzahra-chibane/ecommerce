<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Le statut est requis.',
            'status.in' => 'Statut invalide.',
        ];
    }
}
