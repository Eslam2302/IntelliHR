<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobPostRequest extends FormRequest
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
        return [
            'title'             => ['required', 'string', 'max:255'],
            'description'       => ['required', 'string'],
            'requirements'      => ['nullable', 'string'],
            'responsibilities'  => ['nullable', 'string'],

            'department_id' => ['required', 'integer', 'exists:departments,id'],

            'job_type' => ['required', 'in:internal,external,both'],
            'status'   => ['required', 'in:open,closed'],

            'posted_at' => ['nullable', 'date'],

            'linkedin_job_id' => ['nullable', 'string'],
        ];
    }

    /**
     * Custom messages for validator errors.
     *
     * @return array<string,string>
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Job title is required.',
            'description.required' => 'Job description is required.',
            'department_id.exists' => 'Selected department does not exist.',
            'job_type.in' => 'Job type must be internal, external or both.',
        ];
    }
}