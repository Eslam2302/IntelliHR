<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDepartmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $departmentId = $this->route('departments');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:departments,name,' . $departmentId
            ],
            'description' => [
                'nullable',
                'string',
                'max:500'
            ],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'name' => 'department name',
            'description' => 'department description',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The department name is required.',
            'name.unique' => 'A department with this name already exists.',
            'name.max' => 'The department name cannot exceed 255 characters.',
            'description.max' => 'The description cannot exceed 500 characters.',
        ];
    }
}
