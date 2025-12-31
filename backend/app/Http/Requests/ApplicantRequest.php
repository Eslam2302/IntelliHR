<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $data = [];

        // Convert string boolean values to actual booleans for form-data requests
        if ($this->has('is_employee')) {
            $value = $this->input('is_employee');
            // Handle string representations of booleans
            if (is_string($value)) {
                $normalized = strtolower(trim($value));
                $data['is_employee'] = in_array($normalized, ['true', '1', 'yes', 'on'], true);
            }
        }

        // Convert string numeric values to integers for form-data requests
        if ($this->has('experience_years')) {
            $value = $this->input('experience_years');
            if (is_string($value) && $value !== '') {
                $data['experience_years'] = (int) $value;
            } elseif ($value === '') {
                $data['experience_years'] = null;
            }
        }

        // Convert job_id to integer if it's a string
        if ($this->has('job_id')) {
            $value = $this->input('job_id');
            if (is_string($value) && $value !== '') {
                $data['job_id'] = (int) $value;
            }
        }

        // Convert current_stage_id to integer if it's a string
        if ($this->has('current_stage_id')) {
            $value = $this->input('current_stage_id');
            if (is_string($value) && $value !== '') {
                $data['current_stage_id'] = (int) $value;
            } elseif ($value === '') {
                $data['current_stage_id'] = null;
            }
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }

    public function rules(): array
    {
        $applicantId = $this->route('applicant')?->id;
        $isUpdate = !empty($applicantId);

        $rules = [
            'job_id'           => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'exists:job_posts,id'
            ],
            'first_name'       => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'last_name'        => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'email'            => [
                $isUpdate ? 'sometimes' : 'required',
                'email',
                'max:255'
            ],
            'phone'            => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:20'
            ],
            'is_employee'      => ['nullable', 'boolean'],
            'status'           => [
                $isUpdate ? 'sometimes' : 'required',
                Rule::in(['new', 'shortlisted', 'interviewed', 'hired', 'rejected'])
            ],
            'source'           => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'current_stage_id' => [
                'nullable',
                'integer',
                Rule::exists('hiring_stages', 'id')->where(function ($query) {
                    return $query->where('job_id', $this->input('job_id') ?? $this->route('applicant')?->job_id);
                }),
            ],
            'resume'           => [
                $isUpdate ? 'sometimes' : 'nullable',
                'file',
                'mimes:pdf',
                'max:10240', // 10MB max
            ],
            'resume_path'      => [
                $isUpdate ? 'sometimes' : 'nullable',
                'string',
                'max:255'
            ],
            'applied_at'       => ['nullable', 'date'],
        ];

        // For creation, require either resume file or resume_path
        if (!$isUpdate) {
            $rules['resume'] = [
                'nullable',
                'file',
                'mimes:pdf',
                'max:10240', // 10MB max
                function ($attribute, $value, $fail) {
                    // If no file is uploaded, resume_path must be provided
                    if (empty($value) && empty($this->input('resume_path'))) {
                        $fail('Either a resume file or resume_path must be provided.');
                    }
                },
            ];
        }

        return $rules;
    }
}