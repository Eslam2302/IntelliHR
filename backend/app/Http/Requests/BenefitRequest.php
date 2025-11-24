<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BenefitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isUpdate = in_array($this->method(), ['PUT', 'PATCH']);

        return [
            'employee_id'   => $isUpdate ? ['sometimes', 'exists:employees,id'] : ['required', 'exists:employees,id'],
            'benefit_type'  => $isUpdate ? ['sometimes', 'string', 'max:255'] : ['required', 'string', 'max:255'],
            'amount'        => $isUpdate ? ['sometimes', 'numeric', 'min:0'] : ['required', 'numeric', 'min:0'],
            'is_deduction'  => $isUpdate ? ['sometimes', 'boolean'] : ['boolean'],
            'start_date'    => $isUpdate ? ['sometimes', 'date'] : ['required', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function prepareForValidation()
    {
        $this->merge([
            'is_deduction' => $this->boolean('is_deduction') ?? false,
        ]);
    }
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.exists'   => 'Selected employee does not exist.',

            'benefit_type.required' => 'Benefit type is required.',
            'benefit_type.string'   => 'Benefit type must be a valid string.',
            'benefit_type.max'      => 'Benefit type must not exceed 255 characters.',

            'amount.required' => 'Amount is required.',
            'amount.numeric'  => 'Amount must be a number.',
            'amount.min'      => 'Amount must be at least 0.',

            'is_deduction.boolean' => 'is_deduction must be true or false.',

            'start_date.required' => 'Start date is required.',
            'start_date.date'     => 'Start date must be a valid date.',

            'end_date.date'              => 'End date must be a valid date.',
            'end_date.after_or_equal'    => 'End date must be equal or after the start date.',
        ];
    }
}
