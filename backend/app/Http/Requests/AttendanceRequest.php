<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttendanceRequest extends FormRequest
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
        $isUpdate = !empty($this->route('attendance'));
        $attendance = $this->route('attendance');
        $isCheckIn = $this->is('*/attendance/check-in');
        $isCheckOut = $this->is('*/attendance/check-out');
        
        // For check-in/check-out, employee_id comes from authenticated user
        // For CRUD operations, it can be provided or defaults to authenticated user
        $employeeId = $attendance?->employee_id ?? $this->input('employee_id', $this->user()->employee_id ?? null);

        return [
            'employee_id' => [
                ($isUpdate || $isCheckIn || $isCheckOut) ? 'sometimes' : 'required',
                'integer',
                'exists:employees,id',
            ],
            'date' => [
                ($isUpdate || $isCheckIn || $isCheckOut) ? 'sometimes' : 'sometimes',
                'date',
                function ($attribute, $value, $fail) use ($isUpdate, $isCheckIn, $attendance, $employeeId) {
                    // Only validate uniqueness for create operations (not check-in, not update)
                    if ($value && $employeeId && !$isUpdate && !$isCheckIn) {
                        $query = \App\Models\Attendance::where('employee_id', $employeeId)
                            ->whereDate('date', $value);
                        if ($query->exists()) {
                            $fail('Attendance record already exists for this employee on this date.');
                        }
                    }
                },
            ],
            'check_in' => [
                ($isCheckIn || $isCheckOut) ? 'prohibited' : 'sometimes',
                'date',
            ],
            'check_out' => [
                $isCheckIn ? 'prohibited' : 'sometimes',
                'date',
                'after:check_in',
            ],
            'location' => [
                'sometimes',
                'string',
                'max:255',
            ],
            'check_in_ip' => [
                'sometimes',
                'ip',
            ],
            'check_out_ip' => [
                'sometimes',
                'ip',
            ],
            'notes' => [
                'sometimes',
                'string',
                'max:1000',
            ],
            'status' => [
                'sometimes',
                'string',
                Rule::in(['present', 'absent', 'half_day', 'on_leave', 'late']),
            ],
            'break_duration_minutes' => [
                'sometimes',
                'integer',
                'min:0',
                'max:480', // Max 8 hours break
            ],
            'overtime_hours' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:24', // Max 24 hours overtime
            ],
            'is_late' => [
                'sometimes',
                'boolean',
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date.unique' => 'Attendance record already exists for this employee on this date.',
            'check_out.after' => 'Check-out time must be after check-in time.',
        ];
    }
}

