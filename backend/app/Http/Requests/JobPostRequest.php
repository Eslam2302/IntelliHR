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
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdate = !empty($this->route('jobPost'));
        
        return [
            'title'             => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'description'       => [
                $isUpdate ? 'sometimes' : 'required',
                'string'
            ],
            'requirements'      => ['nullable', 'string'],
            'responsibilities'  => ['nullable', 'string'],

            'department_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'exists:departments,id'
            ],

            'job_type' => [
                $isUpdate ? 'sometimes' : 'required',
                'in:internal,external,both'
            ],
            'status'   => [
                $isUpdate ? 'sometimes' : 'required',
                'in:open,closed'
            ],

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