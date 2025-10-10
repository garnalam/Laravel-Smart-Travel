<?php

namespace App\Http\Requests\city;

use Illuminate\Foundation\Http\FormRequest;

class GetcityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
        ];
    }
}