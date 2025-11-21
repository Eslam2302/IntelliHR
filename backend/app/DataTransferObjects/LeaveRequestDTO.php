<?php

namespace App\DataTransferObjects;

use App\Http\Requests\LeaveRequest;
use Illuminate\Http\UploadedFile;

class LeaveRequestDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly int $leave_type_id,
        public readonly string $start_date,
        public readonly string $end_date,
        public readonly ?string $reason = null,
        public readonly ?UploadedFile $attachment = null,
    ) {}

    public static function fromRequest(LeaveRequest $request): self
    {
        return new self(
            employee_id: $request->input('employee_id'),
            leave_type_id: $request->input('leave_type_id'),
            start_date: $request->input('start_date'),
            end_date: $request->input('end_date'),
            reason: $request->input('reason'),
            attachment: $request->file('attachment')
        );
    }

    public function toArray(): array
    {
        return [
            'employee_id'   => $this->employee_id,
            'leave_type_id' => $this->leave_type_id,
            'start_date'    => $this->start_date,
            'end_date'      => $this->end_date,
            'reason'        => $this->reason,
            'attachment'    => $this->attachment,
        ];
    }
}