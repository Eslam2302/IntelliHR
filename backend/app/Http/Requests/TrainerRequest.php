<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TrainerRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $trainerId = $this->trainer ? $this->trainer->id : null;

        return [
            'type' => ['required', 'in:internal,external'],
            // Internal trainer
            'employee_id' => ['nullable', 'required_if:type,internal', 'exists:employees,id'],

            // External trainer
            'name' => ['nullable', 'required_if:type,external', 'string', 'max:255'],
            'email' => [
                'nullable',
                'required_if:type,external',
                'email',
                'max:255',
                Rule::unique('trainers', 'email')->ignore($this->trainer ?? null)
            ],
            'phone' => ['nullable', 'required_if:type,external', 'string', 'max:20'],
            'company' => ['nullable','required_if:type,external', 'string', 'max:255'],
        ];
    }

    public function messages()
    {
        return [
            'type.required' => 'Trainer type is required.',
            'type.in' => 'Type must be internal or external.',

            'employee_id.required_if' => 'Employee ID is required for internal trainers.',
            'employee_id.exists' => 'Employee not found.',

            'name.required_if' => 'Name is required for external trainers.',
            'email.required_if' => 'Email is required for external trainers.',
            'email.email' => 'Invalid email format.',
            'email.unique' => 'Email already exists.',
            'phone.required_if' => 'Phone is required for external trainers.',
        ];
    }
}
