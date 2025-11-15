<?php

namespace App\Repositories;

use App\Models\Attendance;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class AttendanceRepository implements AttendanceRepositoryInterface
{
    public function __construct(protected Attendance $model) {}

    public function getAllPaginatedForUser($user, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->visibleToUser($user)->with('employee')->orderBy('check_in', 'desc')->paginate($perPage);
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
