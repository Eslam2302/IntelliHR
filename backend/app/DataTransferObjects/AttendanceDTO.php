<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AttendanceRequest;
use Carbon\Carbon;

class AttendanceDTO
{
    public function __construct(
        public readonly int $employeeId,
        public readonly ?string $date = null,
        public readonly ?\DateTime $checkIn = null,
        public readonly ?\DateTime $checkOut = null,
        public readonly ?string $location = null,
        public readonly ?string $checkInIp = null,
        public readonly ?string $checkOutIp = null,
        public readonly ?string $notes = null,
        public readonly ?string $status = null,
        public readonly ?int $breakDurationMinutes = null,
        public readonly ?float $overtimeHours = null,
        public readonly ?bool $isLate = null,
    ) {}

    public static function fromRequest(AttendanceRequest $request): self
    {
        $isUpdate = !empty($request->route('attendance'));
        $attendance = $request->route('attendance');

        $employeeId = $isUpdate && $attendance
            ? ($request->validated('employee_id') ?? $attendance->employee_id)
            : ($request->validated('employee_id') ?? ($request->user()->employee_id ?? 0));

        return new self(
            employeeId: $employeeId,
            date: $request->validated('date') ?? ($isUpdate ? null : now()->toDateString()),
            checkIn: $request->validated('check_in') ? Carbon::parse($request->validated('check_in')) : null,
            checkOut: $request->validated('check_out') ? Carbon::parse($request->validated('check_out')) : null,
            location: $request->validated('location'),
            checkInIp: $request->validated('check_in_ip') ?? $request->ip(),
            checkOutIp: $request->validated('check_out_ip') ?? $request->ip(),
            notes: $request->validated('notes'),
            status: $request->validated('status'),
            breakDurationMinutes: $request->validated('break_duration_minutes'),
            overtimeHours: $request->validated('overtime_hours'),
            isLate: $request->has('is_late') ? $request->boolean('is_late') : null,
        );
    }


    public function toArray(): array
    {
        $data = [
            'employee_id' => $this->employeeId,
            'date' => $this->date,
            'check_in' => $this->checkIn,
            'check_out' => $this->checkOut,
            'location' => $this->location,
            'check_in_ip' => $this->checkInIp,
            'check_out_ip' => $this->checkOutIp,
            'notes' => $this->notes,
            'status' => $this->status,
            'break_duration_minutes' => $this->breakDurationMinutes,
            'overtime_hours' => $this->overtimeHours,
            'is_late' => $this->isLate,
        ];

        return array_filter($data, fn($value) => $value !== null);
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Don't allow updating employee_id or date on update
        unset($data['employee_id'], $data['date']);
        return array_filter($data, fn($value) => $value !== null && $value !== '');
    }
}
