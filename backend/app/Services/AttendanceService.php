<?php

namespace App\Services;

use App\DataTransferObjects\AttendanceDTO;
use App\Exceptions\AlreadyCheckedInException;
use App\Exceptions\AlreadyCheckedOutException;
use App\Exceptions\DuplicateAttendanceException;
use App\Exceptions\NoCheckInFoundException;
use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    // Default work schedule (9 AM to 5 PM)
    private const DEFAULT_START_TIME = '09:00';
    private const DEFAULT_END_TIME = '17:00';
    private const DEFAULT_WORK_HOURS = 8;

    public function __construct(
        protected AttendanceRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching attendances: '.$e->getMessage());
            throw $e;
        }
    }

    public function checkIn(AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $date = $dto->date ?? now()->toDateString();
            $existing = $this->repository->findByEmployeeAndDate($dto->employeeId, $date);
            
            if ($existing) {
                throw new AlreadyCheckedInException();
            }

            $checkInTime = $dto->checkIn ?? now();
            $isLate = $this->calculateLateStatus($dto->employeeId, $checkInTime);

            $attendance = $this->repository->create([
                'employee_id' => $dto->employeeId,
                'date' => $date,
                'check_in' => $checkInTime,
                'is_late' => $isLate,
                'location' => $dto->location,
                'check_in_ip' => $dto->checkInIp,
                'notes' => $dto->notes,
                'status' => $dto->status ?? 'present',
            ]);

            $this->activityLogger->log(
                logName: 'attendance',
                description: 'employee_checked_in',
                subject: $attendance,
                properties: [
                    'employee_id' => $attendance->employee_id,
                    'date' => $attendance->date,
                    'check_in' => $attendance->check_in,
                    'is_late' => $attendance->is_late,
                    'location' => $attendance->location,
                ]
            );

            DB::commit();
            Log::info('Employee checked in', ['employee_id' => $dto->employeeId, 'date' => $date]);

            return $attendance->load('employee');
        } catch (AlreadyCheckedInException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Check-in error: '.$e->getMessage(), ['employee_id' => $dto->employeeId]);
            throw $e;
        }
    }

    public function checkOut(AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $date = $dto->date ?? now()->toDateString();
            $attendance = $this->repository->findByEmployeeAndDate($dto->employeeId, $date);
            
            if (! $attendance) {
                throw new NoCheckInFoundException();
            }

            if ($attendance->check_out) {
                throw new AlreadyCheckedOutException();
            }

            $checkOutTime = $dto->checkOut ?? now();
            $calculatedHours = $this->calculateWorkedHours($attendance->check_in, $checkOutTime, $dto->breakDurationMinutes);
            $overtimeHours = $this->calculateOvertime($dto->employeeId, $calculatedHours);

            $attendance = $this->repository->update($attendance, [
                'check_out' => $checkOutTime,
                'calculated_hours' => $calculatedHours,
                'overtime_hours' => $overtimeHours,
                'break_duration_minutes' => $dto->breakDurationMinutes,
                'check_out_ip' => $dto->checkOutIp,
                'notes' => $dto->notes ?? $attendance->notes,
            ]);

            $this->activityLogger->log(
                logName: 'attendance',
                description: 'employee_checked_out',
                subject: $attendance,
                properties: [
                    'employee_id' => $attendance->employee_id,
                    'date' => $attendance->date,
                    'check_out' => $attendance->check_out,
                    'calculated_hours' => $attendance->calculated_hours,
                    'overtime_hours' => $attendance->overtime_hours,
                ]
            );

            DB::commit();
            Log::info('Employee checked out', ['employee_id' => $dto->employeeId, 'date' => $date]);

            return $attendance->load('employee');
        } catch (NoCheckInFoundException | AlreadyCheckedOutException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Check-out error: '.$e->getMessage(), ['employee_id' => $dto->employeeId]);
            throw $e;
        }
    }

    /**
     * Create a new attendance record
     */
    public function create(AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $date = $dto->date ?? now()->toDateString();
            
            // Check for duplicate
            $existing = $this->repository->findByEmployeeAndDate($dto->employeeId, $date);
            if ($existing) {
                throw new DuplicateAttendanceException();
            }

            $data = $dto->toArray();
            if (!isset($data['date'])) {
                $data['date'] = $date;
            }
            if (!isset($data['status'])) {
                $data['status'] = 'present';
            }

            // Calculate late status if check_in is provided
            if (isset($data['check_in']) && !isset($data['is_late'])) {
                $data['is_late'] = $this->calculateLateStatus($dto->employeeId, Carbon::parse($data['check_in']));
            }

            // Calculate hours if both check_in and check_out are provided
            if (isset($data['check_in']) && isset($data['check_out'])) {
                $data['calculated_hours'] = $this->calculateWorkedHours(
                    Carbon::parse($data['check_in']),
                    Carbon::parse($data['check_out']),
                    $data['break_duration_minutes'] ?? null
                );
                $data['overtime_hours'] = $this->calculateOvertime($dto->employeeId, $data['calculated_hours']);
            }

            $attendance = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'attendance',
                description: 'attendance_created',
                subject: $attendance,
                properties: [
                    'employee_id' => $attendance->employee_id,
                    'date' => $attendance->date,
                    'status' => $attendance->status,
                ]
            );

            DB::commit();
            Log::info('Attendance created', ['id' => $attendance->id, 'employee_id' => $dto->employeeId]);

            return $attendance->load('employee');
        } catch (DuplicateAttendanceException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating attendance: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an existing attendance record
     */
    public function update(Attendance $attendance, AttendanceDTO $dto): Attendance
    {
        DB::beginTransaction();
        try {
            $oldData = $attendance->only([
                'check_in',
                'check_out',
                'status',
                'is_late',
                'calculated_hours',
                'overtime_hours',
            ]);

            $data = $dto->toUpdateArray();

            // Recalculate late status if check_in is being updated
            if (isset($data['check_in']) && !isset($data['is_late'])) {
                $data['is_late'] = $this->calculateLateStatus($attendance->employee_id, Carbon::parse($data['check_in']));
            }

            // Recalculate hours if check_in or check_out are being updated
            $checkIn = isset($data['check_in']) ? Carbon::parse($data['check_in']) : $attendance->check_in;
            $checkOut = isset($data['check_out']) ? Carbon::parse($data['check_out']) : $attendance->check_out;
            
            if ($checkIn && $checkOut) {
                $data['calculated_hours'] = $this->calculateWorkedHours(
                    $checkIn,
                    $checkOut,
                    $data['break_duration_minutes'] ?? $attendance->break_duration_minutes
                );
                $data['overtime_hours'] = $this->calculateOvertime($attendance->employee_id, $data['calculated_hours']);
            }

            $updated = $this->repository->update($attendance, $data);

            $this->activityLogger->log(
                logName: 'attendance',
                description: 'attendance_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after' => $updated->only([
                        'check_in',
                        'check_out',
                        'status',
                        'is_late',
                        'calculated_hours',
                        'overtime_hours',
                    ]),
                ]
            );

            DB::commit();
            Log::info('Attendance updated', ['id' => $updated->id]);

            return $updated->load('employee');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating attendance: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an attendance record
     */
    public function delete(Attendance $attendance): bool
    {
        DB::beginTransaction();
        try {
            $data = $attendance->only(['id', 'employee_id', 'date']);

            $deleted = $this->repository->delete($attendance);

            $this->activityLogger->log(
                logName: 'attendance',
                description: 'attendance_deleted',
                subject: $attendance,
                properties: $data
            );

            DB::commit();
            Log::info('Attendance deleted', ['id' => $attendance->id]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting attendance: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a single attendance record
     */
    public function show(int $id): Attendance
    {
        $attendance = $this->repository->find($id);
        if (!$attendance) {
            throw new \Exception('Attendance not found');
        }
        return $attendance;
    }

    /**
     * Find attendance by employee and date
     */
    public function findByEmployeeAndDate(int $employeeId, string $date): ?Attendance
    {
        return $this->repository->findByEmployeeAndDate($employeeId, $date);
    }

    /**
     * Calculate if employee is late based on work schedule
     */
    private function calculateLateStatus(int $employeeId, Carbon $checkInTime): bool
    {
        $workStartTime = $this->getEmployeeWorkStartTime($employeeId);
        return $checkInTime->greaterThan($workStartTime);
    }

    /**
     * Get employee's work start time (from contract or default)
     */
    private function getEmployeeWorkStartTime(int $employeeId): Carbon
    {
        // Try to get from employee's contract
        $employee = \App\Models\Employee::with('contract')->find($employeeId);
        
        // For now, use default. In future, can be extended to read from contract or employee settings
        $defaultTime = Carbon::createFromTimeString(self::DEFAULT_START_TIME);
        
        return $defaultTime;
    }

    /**
     * Calculate worked hours
     */
    private function calculateWorkedHours(Carbon $checkIn, Carbon $checkOut, ?int $breakMinutes = null): float
    {
        $totalMinutes = $checkIn->diffInMinutes($checkOut);
        
        if ($breakMinutes) {
            $totalMinutes -= $breakMinutes;
        }

        return round($totalMinutes / 60, 2);
    }

    /**
     * Calculate overtime hours
     */
    private function calculateOvertime(int $employeeId, float $workedHours): float
    {
        $expectedHours = self::DEFAULT_WORK_HOURS;
        $overtime = $workedHours - $expectedHours;
        
        return $overtime > 0 ? round($overtime, 2) : 0;
    }
}
