<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeductionRequest extends FormRequest
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
        $isUpdate = !empty($this->route('deduction'));
        
        return [
            'payroll_id' =>    ['nullable', 'exists:payrolls,id'],
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:employees,id'
            ],
            'type' =>        [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:255'
            ],
            'amount' =>      [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0'
            ],
        ];
    }

    public function messages()
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.exists'   => 'Employee does not exist.',

            'payroll_id.exists'    => 'Payroll not found.',

            'type.required'        => 'Allowance type is required.',

            'amount.required'      => 'Amount is required.',
            'amount.numeric'       => 'Amount must be a valid number.',
            'amount.min'           => 'Amount must be zero or greater.',
        ];
    }
}
