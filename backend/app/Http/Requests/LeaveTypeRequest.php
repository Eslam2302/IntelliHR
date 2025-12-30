<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Get ID for update (unique rule exception)
        $leaveTypeId = $this->route('leave_type')?->id;
        $isUpdate = !empty($leaveTypeId);

        return [
            // Name
            'name' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:100',
                'unique:leave_types,name,' . ($leaveTypeId ?? 'NULL'),
            ],

            // Short code (AL, SL, ML)
            'code' => [
                $isUpdate ? 'sometimes' : 'required',
                'string',
                'max:10',
                'unique:leave_types,code,' . ($leaveTypeId ?? 'NULL'),
            ],

            // Annual leave entitlement
            'annual_entitlement' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:0',
                'max:365'
            ],

            // Accrual method
            'accrual_policy' => [
                $isUpdate ? 'sometimes' : 'required',
                'in:none,monthly,annual'
            ],

            // Carry over limit
            'carry_over_limit' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:0',
                'max:365'
            ],

            // Minimum request days
            'min_request_days' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:1'
            ],

            // Maximum request days
            'max_request_days' => [
                $isUpdate ? 'sometimes' : 'required',
                'integer',
                'min:1',
                'gte:min_request_days'
            ],

            // Workflow – HR approval needed?
            'requires_hr_approval' => [
                $isUpdate ? 'sometimes' : 'required',
                'boolean'
            ],

            // Is the leave type active?
            'is_active' => [
                'sometimes',
                'boolean'
            ],

            // paid / unpaid / partially paid
            'payment_type' => [
                $isUpdate ? 'sometimes' : 'required',
                'in:paid,unpaid,partially_paid'
            ],

            // Does it require proof (e.g. sick leave)?
            'requires_attachment' => [
                $isUpdate ? 'sometimes' : 'required',
                'boolean'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'This leave type name is already in use.',
            'code.unique' => 'This leave type code is already taken.',
            'max_request_days.gte' => 'Maximum request days must be greater than or equal to minimum request days.',
            'annual_entitlement.min' => 'Annual entitlement must be zero or above.',
        ];
    }
}