<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContractRequest extends FormRequest
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
        $contractId = $this->route('contract')?->id;

        return [
            'employee_id' => ['required', 'unique:contracts,employee_id,' . $contractId, 'exists:employees,id'],
            'start_date' => ['required', 'date'],
            'end_date'  => ['nullable', 'date', 'after_or_equal:start_date'],
            'contract_type' => [
                'required',
                'in:permanent,full_time,part_time,fixed_term,temporary,project_based,seasonal,probation,internship,consultant,contractor,freelance,hourly,commission_based,on_call'
            ],
            'salary' => ['required', 'numeric', 'min:0'],
            'terms'          => ['nullable', 'string'],
        ];
    }
}
