<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeTrainingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Validation rules for storing/updating EmployeeTraining.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'exists:employees,id'],
            'training_id' => ['required', 'exists:training_sessions,id'],
            'status' => ['required', 'in:enrolled,completed,cancelled'],
            'completion_date' => ['nullable', 'date'],
        ];
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.exists' => 'Employee does not exist.',
            'training_id.required' => 'Training session is required.',
            'training_id.exists' => 'Training session does not exist.',
            'status.required' => 'Status is required.',
            'status.in' => 'Status must be enrolled, completed, or cancelled.',
            'completion_date.date' => 'Completion date must be a valid date.',
        ];
    }
}
