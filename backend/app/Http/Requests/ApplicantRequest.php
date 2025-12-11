<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplicantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $applicantId = $this->route('applicant')?->id;

        return [
            'job_id'           => ['required', 'integer', 'exists:job_posts,id'],
            'first_name'       => ['required', 'string', 'max:255'],
            'last_name'        => ['required', 'string', 'max:255'],
            'email'            => ['required', 'email', 'max:255'],
            'phone'            => ['required', 'string', 'max:20'],
            'is_employee'      => ['boolean'],
            'status'           => ['required', Rule::in(['new', 'shortlisted', 'interviewed', 'hired', 'rejected'])],
            'source'           => ['nullable', 'string', 'max:255'],
            'experience_years' => ['nullable', 'integer', 'min:0'],
            'current_stage_id' => [
                'nullable',
                'integer',
                Rule::exists('hiring_stages', 'id')->where(function ($query) {
                    return $query->where('job_id', $this->input('job_id'));
                }),
            ],
            'resume_path'      => ['required', 'string', 'max:255'],
            'applied_at'       => ['nullable', 'date'],
        ];
    }
}