<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExpenseRequest extends FormRequest
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
        // Check if it's an update request
        $isUpdate = $this->method() === 'PUT' || $this->method() === 'PATCH';

        return [
            'employee_id'  => $isUpdate ? ['sometimes', 'exists:employees,id'] : ['required', 'exists:employees,id'],
            'amount'       => $isUpdate ? ['sometimes', 'numeric', 'min:0'] : ['required', 'numeric', 'min:0'],
            'expense_date' => $isUpdate ? ['sometimes', 'date'] : ['required', 'date'],
            'category_id'  => $isUpdate ? ['sometimes', 'exists:expense_categories,id'] : ['required', 'exists:expense_categories,id'],
            'receipt_path' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],

            // notes will only be used on update (approve/reject)
            'notes'        => $isUpdate ? ['required', 'string'] : ['nullable', 'string'],

            // status is not set by employee — reviewers only
            'status'       => ['nullable', 'in:pending,approved,rejected'],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages()
    {
        return [
            'employee_id.required' => 'Employee is required.',
            'employee_id.exists'   => 'Employee does not exist.',

            'amount.required'      => 'Amount is required.',
            'amount.numeric'       => 'Amount must be a valid number.',
            'amount.min'           => 'Amount must be zero or greater.',

            'expense_date.required' => 'Expense date is required.',
            'expense_date.date'     => 'Expense date must be a valid date.',

            'category_id.required' => 'Expense category is required.',
            'category_id.exists'   => 'Expense category does not exist.',

            'receipt_path.string'  => 'Receipt path must be a valid string.',

            'status.in'            => 'Status must be pending, approved, or rejected.',
        ];
    }
}
