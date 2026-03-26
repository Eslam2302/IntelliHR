<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware (permission:edit-employee)
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $employeeParam = $this->route('employee');
        $employeeId = $employeeParam instanceof \App\Models\Employee
            ? $employeeParam->id
            : $employeeParam;

        $userId = $employeeParam instanceof \App\Models\Employee
            ? $employeeParam->user?->id
            : \App\Models\User::where('employee_id', $employeeId)->value('id');

        return [
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
            ],
            'work_email' => [
                'nullable',
                'email',
                'unique:employees,work_email,' . $employeeId,
            ],

            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],
            'gender' => [
                'required',
                'in:male,female',
            ],
            'national_id' => [
                'required',
                'string',
                'max:20',
            ],
            'birth_date' => [
                'required',
                'date',
                'before:today',
            ],
            'address' => [
                'nullable',
                'string',
            ],
            'employee_status' => [
                'in:active,probation,resigned,terminated',
            ],
            'department_id' => [
                'required',
                'exists:departments,id',
            ],
            'manager_id' => [
                'nullable',
                'exists:employees,id',
            ],
            'job_id' => [
                'nullable',
                'exists:job_positions,id',
            ],
            'hire_date' => [
                'required',
                'date',
            ],

            'personal_email' => [
                'required',
                'email',
                'unique:users,personal_email,' . $userId,
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]+$/',
            ],
        ];
    }
}
