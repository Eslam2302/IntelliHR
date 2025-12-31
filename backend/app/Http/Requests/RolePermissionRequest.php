<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RolePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'permissions'   => ['required', 'array'],
            'permissions.*' => ['exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'permissions.required' => 'Permissions are required.',
            'permissions.array'    => 'Permissions must be an array.',
            'permissions.*.exists' => 'One or more permissions are invalid.',
        ];
    }
}