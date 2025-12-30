<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InterviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Define validation rules for creating/updating an interview.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $isUpdate = !empty($this->route('interview'));
        
        return [
            'applicant_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:applicants,id'
            ],
            'interviewer_id' => ['nullable', 'exists:employees,id'],
            'scheduled_at' => [
                $isUpdate ? 'sometimes' : 'required',
                'date'
            ],
            'score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'notes' => ['nullable', 'string'],
            'status' => [
                $isUpdate ? 'sometimes' : 'required',
                Rule::in(['scheduled', 'done', 'canceled'])
            ],
        ];
    }
}