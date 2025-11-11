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
            'name' => 'required|string|max:255',
            'job_title' => 'required|string|max:255',
            'personal_email' => 'nullable|email|unique:employees,personal_email',
            'phone' => 'nullable|string|max:20',
            'hire_date' => 'required|date',

            'department_id' => 'required|exists:departments,id',
            'manager_id' => 'nullable|exists:employees,id',

            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ];
    }
}