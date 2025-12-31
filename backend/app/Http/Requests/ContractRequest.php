<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class ContractRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $contract = $this->route('contract'); // Model binding
        $isUpdate = !empty($contract);

        return [
            'employee_id' => [
                $isUpdate ? 'sometimes' : 'required',
                'exists:employees,id',
                Rule::unique('contracts', 'employee_id')
                    ->ignore($contract?->id),
            ],
            'start_date' => [
                $isUpdate ? 'sometimes' : 'required',
                'date'
            ],
            'end_date'  => ['nullable', 'date', 'after_or_equal:start_date'],
            'contract_type' => [
                $isUpdate ? 'sometimes' : 'required',
                'in:permanent,full_time,part_time,fixed_term,temporary,project_based,seasonal,probation,internship,consultant,contractor,freelance,hourly,commission_based,on_call'
            ],
            'salary' => [
                $isUpdate ? 'sometimes' : 'required',
                'numeric',
                'min:0'
            ],
            'terms' => ['nullable', 'string'],
            'probation_period_days' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
