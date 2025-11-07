<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $employeeId = $this->route('employees');
        return [
            'name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'hire_date' => 'required|date',

            'personal_email' => [
                'nullable',
                'email',
                Rule::unique('employees', 'personal_email')->ignore($employeeId),
            ],

            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:employees,id',

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($employeeId, 'employee_id'),
            ],

            'password' => 'string|min:8',
        ];
    }
}