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
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        $isUpdate = !empty($this->route('certificate'));
        
        return [
            'employee_training_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:employee_trainings,id'
            ],
            'issued_at' => ['nullable', 'date'],
            'certificate_path' => [
                'nullable',
                'string',
                'max:255'
            ],
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
            'certificate_path.max' => 'Certificate path must not exceed 255 characters.',
        ];
    }
}