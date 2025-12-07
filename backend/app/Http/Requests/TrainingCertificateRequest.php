<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrainingCertificateRequest extends FormRequest
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
        return [
            'employee_training_id' => ['required', 'exists:employee_trainings,id'],
            'issued_at' => ['nullable', 'date'],
            'certificate_path' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'employee_training_id.required' => 'Employee training ID is required.',
            'employee_training_id.exists' => 'Employee training not found.',
            'certificate_path.required' => 'Certificate path is required.',
        ];
    }
}