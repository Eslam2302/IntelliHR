<?php

namespace App\Http\Requests;

use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{

    public function authorize(): bool
    {
        return Auth::check() && Auth::user()->role === 'Admin';
    }

    public function rules(): array
    {

        return [
            'name' => 'required|string|max:255|unique:departments,name,' . $this->route('department')->id,
            'description' => 'nullable|string|max:500',
        ];
    }
}
