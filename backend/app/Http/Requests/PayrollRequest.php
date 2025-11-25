<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayrollRequest extends FormRequest
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
        $payrollId = $this->route('payroll')?->id ?? null;

        return [

            'employee_id' => [
                'required',
                'exists:employees,id',
                // unique payroll per employee/year/month
                'unique:payrolls,employee_id,' . $payrollId . ',id,year,' . $this->year . ',month,' . $this->month,

            ],

            'year'  => ['required', 'integer', 'min:2000', 'max:2100'],
            'month' => ['required', 'integer', 'between:1,12'],

            'basic_salary' => ['required', 'numeric', 'min:0'],

            'allowances'   => ['nullable', 'numeric', 'min:0'],
            'deductions'   => ['nullable', 'numeric', 'min:0'],

            'processed_at' => ['nullable', 'date'],
        ];
    }
}
