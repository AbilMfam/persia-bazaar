<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
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
            'title'       => ['required', 'string', 'min:2', 'max:255'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'category'    => ['nullable', 'string', 'max:64', Rule::exists('categories', 'slug')],
            'price'       => ['required', 'integer', 'min:0', 'max:999999999'],
            // Accept absolute URLs or inline data URIs from the mobile/web client.
            'image_url'   => ['nullable', 'string', 'max:5242880'],
        ];
    }
}
