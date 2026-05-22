<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');
        return $this->user() && $product && $product->user_id === $this->user()->id;
    }

    protected function prepareForValidation(): void
    {
        $cat = $this->input('category');
        if ($cat === '') {
            $this->merge(['category' => null]);
        }
    }

    public function rules(): array
    {
        return [
            'title'       => ['sometimes', 'string', 'min:2', 'max:255'],
            'description' => ['sometimes', 'string', 'min:10', 'max:5000'],
            'category'    => ['sometimes', 'nullable', 'string', 'max:64', Rule::exists('categories', 'slug')],
            'price'       => ['sometimes', 'integer', 'min:0', 'max:999999999'],
            'image_url'   => ['sometimes', 'nullable', 'string', 'max:5242880'],
        ];
    }
}
