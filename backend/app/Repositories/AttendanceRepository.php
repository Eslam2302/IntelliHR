<?php

namespace App\Repositories;

use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class AttendanceRepository implements AttendanceRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(protected Attendance $model) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('employee');

        // Apply authorization scope if user is authenticated
        if (auth()->check() && method_exists($this->model, 'scopeVisibleToUser')) {
            $query = $query->visibleToUser(auth()->user());
        }

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'employee.first_name', 'employee.last_name', 'employee.work_email', 'employee.phone', 'date', 'status'],
            ['id', 'employee_id', 'date', 'check_in', 'check_out', 'status', 'created_at'],
            'check_in',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 15));
    }

    public function findTodayByEmployee(int $employeeId): ?Attendance
    {
        return $this->model->where('employee_id', $employeeId)->whereDate('date', now())->first();
    }

    public function findByEmployeeAndDate(int $employeeId, string $date): ?Attendance
    {
        return $this->model->where('employee_id', $employeeId)
            ->whereDate('date', $date)
            ->first();
    }

    public function getEmployeeAttendanceStats(int $employeeId, ?string $startDate = null, ?string $endDate = null): array
    {
        $query = $this->model->where('employee_id', $employeeId);

        if ($startDate) {
            $query->whereDate('date', '>=', $startDate);
        }

        if ($endDate) {
            $query->whereDate('date', '<=', $endDate);
        }

        $totalRecords = $query->count();
        $presentCount = (clone $query)->where('status', 'present')->count();
        $lateCount = (clone $query)->where('is_late', true)->count();
        $absentCount = (clone $query)->where('status', 'absent')->count();
        $totalHours = (clone $query)->whereNotNull('calculated_hours')->sum('calculated_hours');
        $totalOvertime = (clone $query)->whereNotNull('overtime_hours')->sum('overtime_hours');

        return [
            'total_records' => $totalRecords,
            'present_count' => $presentCount,
            'late_count' => $lateCount,
            'absent_count' => $absentCount,
            'total_hours' => round($totalHours, 2),
            'total_overtime_hours' => round($totalOvertime, 2),
        ];
    }

    public function create(array $data): Attendance
    {
        return $this->model->create($data);
    }

    public function update(Attendance $attendance, array $data): Attendance
    {
        $attendance->update($data);

        return $attendance->fresh();
    }

    public function delete(Attendance $attendance): bool
    {
        return $attendance->delete();
    }

    public function find(int $id): ?Attendance
    {
        return $this->model->find($id);
    }
}
