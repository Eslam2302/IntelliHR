<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetAssignmentRequest extends FormRequest
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
        $assignmentId = $this->asset_assignment ? $this->asset_assignment->id : null;

        return [
            'asset_id' => ['required', 'exists:assets,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'assigned_date' => ['required', 'date'],
            'return_date' => ['nullable', 'date', 'after_or_equal:assigned_date'],
        ];
    }

    public function messages()
    {
        return [
            'asset_id.required' => 'Asset ID is required.',
            'asset_id.exists' => 'Asset not found.',
            'employee_id.required' => 'Employee ID is required.',
            'employee_id.exists' => 'Employee not found.',
            'assigned_date.required' => 'Assigned date is required.',
            'assigned_date.date' => 'Assigned date must be a valid date.',
            'return_date.date' => 'Return date must be a valid date.',
            'return_date.after_or_equal' => 'Return date must be after or equal to assigned date.',
        ];
    }
}