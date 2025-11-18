<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class StoreEmployeeRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => [
                'required',
                'string',
                'max:100'
            ],
            'last_name' => [
                'required',
                'string',
                'max:100'
            ],
            'personal_email' => [
                'nullable',
                'email',
                'unique:employees,personal_email'
            ],
            'phone' => [
                'nullable',
                'string',
                'max:20',
            ],
            'gender' => [
                'required',
                'in:male,female'
            ],
            'national_id' => [
                'required',
                'string',
                'max:20'
            ],
            'birth_date' => [
                'required',
                'date',
                'before:today'
            ],
            'address' => [
                'nullable',
                'string'
            ],
            'employee_status' => [
                'required',
                'in:active,resigned,terminated'
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

            'email' => ['required', 'email', 'unique:users,email'],

            'password' => [
                'required',
                'string',
                'min:8',
            ],
        ];
    }
}
