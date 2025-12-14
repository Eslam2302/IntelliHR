<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobPositionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'min_salary' => number_format((float)$this->min_salary, 2, '.', ''),
            'max_salary' => number_format((float)$this->max_salary, 2, '.', ''),
        ]);
    }


    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $jobPositionId = $this->route('job_position')?->id;
        return [
            'title' => [
                'required',
                'unique:job_positions,title,' . $jobPositionId,
                'string',
                'max:100'
            ],
            'grade' => [
                'required',
                'string',
            ],
            'department_id' => [
                'required',
            ],
            'min_salary' => [
                'required',
                'numeric',
                'regex:/^\d{1,10}(\.\d{1,2})?$/'
            ],
            'max_salary' => [
                'required',
                'numeric',
                'regex:/^\d{1,10}(\.\d{1,2})?$/'
            ],
            'responsibilities' => [
                'nullable',
                'string',
                'max:500'
            ]

        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The Job title is required.',
            'title.unique' => 'The Job title must be uniqued.',
            'grade.required' => 'A Job title is required',
            'min_salary.required' => 'A Job minimum salary is required',
            'max_salary.required' => 'A Job maximum salary is required',
        ];
    }
}
