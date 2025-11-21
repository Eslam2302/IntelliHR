<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\LeaveType;

class LeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'start_date'    => ['required', 'date', 'after_or_equal:today'],
            'end_date'      => ['required', 'date', 'after_or_equal:start_date'],
            'reason'        => ['nullable', 'string', 'max:500'],
            'attachment'    => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:2048'],
        ];
    }

    /**
     * Configure the validator instance.
     * --- IGNORE ---
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {

            $leaveType = LeaveType::find($this->leave_type_id);

            if (!$leaveType) return;

            // Check if attachment is required
            if ($leaveType->requires_attachment && !$this->hasFile('attachment')) {
                $validator->errors()->add('attachment', 'This leave type requires an attachment.');
            }
        });
    }

}