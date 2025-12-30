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
        $isUpdate = !empty($payrollId);

        return [
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:employees,id',
                // unique payroll per employee/year/month
                'unique:payrolls,employee_id,' . $payrollId . ',id,year,' . ($this->year ?? $this->route('payroll')?->year) . ',month,' . ($this->month ?? $this->route('payroll')?->month),
            ],

            'year'  => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:2000',
                'max:2100'
            ],
            'month' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'between:1,12'
            ],

            'basic_salary' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0'
            ],

            'allowances'   => ['nullable', 'numeric', 'min:0'],
            'deductions'   => ['nullable', 'numeric', 'min:0'],

            'processed_at' => ['nullable', 'date'],
        ];
    }
}
