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
        $isUpdate = !empty($applicantId);

        return [
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
            'is_employee'      => ['boolean'],
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
            'resume_path'      => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'applied_at'       => ['nullable', 'date'],
        ];
    }
}