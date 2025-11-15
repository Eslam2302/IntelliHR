<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;

class AttendanceDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly ?\DateTime $check_in = null,
        public readonly ?\DateTime $check_out = null,
    ) {}

    public static function fromCheckInRequest(StoreAttendanceRequest $request, int $employeeId): self
    {
        return new self(employee_id: $employeeId, check_in: now());
    }

    public static function fromCheckOutRequest(UpdateAttendanceRequest $request, int $employeeId, \DateTime $checkIn): self
    {
        return new self(employee_id: $employeeId, check_in: $checkIn, check_out: now());
    }
}
