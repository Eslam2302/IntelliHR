<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveTypeRequest extends FormRequest
{
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

        $leaveTypeId = $this->route('leave_type') ? $this->route('leave_type')->id : null;

        // For update unique type name except this type u need to update
        $uniqueRule = 'unique:leave_types,name';
        if ($leaveTypeId) {
            $uniqueRule = 'unique:leave_types,name,' . $leaveTypeId;
        }

        return [
            'name' => ['required', 'string', 'max:100', $uniqueRule],
            'description' => ['nullable', 'string', 'max:500'],
            'max_days_per_year' => ['required', 'integer', 'min:0'],
            'is_paid' => ['required', 'boolean'],
            'requires_proof' => ['required', 'boolean'],
        ];
    }
    public function messages(): array
    {
        return [
            'name.unique' => 'This name for the type of leave is already in use.',
            'is_paid.required' => 'It must be determined whether the leave is paid or not.',
            'max_days_per_year.min' => 'The maximum number of days must be a positive number or zero.',
        ];
    }
}
