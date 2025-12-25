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

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone'],
            ['id', 'employee_id', 'check_in', 'check_out', 'created_at'],
            'check_in',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 15));
    }

    public function findTodayByEmployee(int $employeeId): ?Attendance
    {
        return $this->model->where('employee_id', $employeeId)->whereDate('check_in', now())->first();
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
}
