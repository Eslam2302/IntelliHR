<?php

namespace App\Services;

use App\DataTransferObjects\AttendanceDTO;
use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AttendanceService
{
    public function __construct(protected AttendanceRepositoryInterface $repository) {}

    public function getAllPaginatedForUser($user, int $perPage = 15)
    {
        return $this->repository->getAllPaginatedForUser($user, $perPage);
    }

    public function checkIn(AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $existing = $this->repository->findTodayByEmployee($dto->employee_id);
            if ($existing) {
                throw new \Exception('You already checked in today.');
            }

            $isLate = Carbon::now()->greaterThan(Carbon::createFromTime(10, 0, 0));

            $attendance = $this->repository->create([
                'employee_id' => $dto->employee_id,
                'check_in' => now(),
                'is_late' => $isLate
            ]);

            DB::commit();
            Log::info("Employee checked in", ['employee_id' => $dto->employee_id]);

            return $attendance->load('employee');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Check-in error: " . $e->getMessage(), ['employee_id' => $dto->employee_id]);
            throw $e;
        }
    }

    public function checkOut(AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $attendance = $this->repository->findTodayByEmployee($dto->employee_id);
            if (!$attendance) {
                throw new \Exception('You must check in first.');
            }

            if ($attendance->check_out) {
                throw new \Exception('You already checked out today.');
            }

            $totalSeconds = abs($dto->check_out->getTimestamp() - $attendance->check_in->getTimestamp());
            $calculatedHours = round($totalSeconds / 3600, 2);

            $attendance = $this->repository->update($attendance, [
                'check_out' => $dto->check_out,
                'calculated_hours' => $calculatedHours
            ]);

            DB::commit();
            Log::info("Employee checked out", ['employee_id' => $dto->employee_id]);

            return $attendance->load('employee');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Check-out error: " . $e->getMessage(), ['employee_id' => $dto->employee_id]);
            throw $e;
        }
    }
}
