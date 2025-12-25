<?php

namespace App\Repositories\Contracts;

use App\Models\Attendance;
use Illuminate\Pagination\LengthAwarePaginator;

interface AttendanceRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findTodayByEmployee(int $employeeId): ?Attendance;

    public function create(array $data): Attendance;

    public function update(Attendance $attendance, array $data): Attendance;

    public function delete(Attendance $attendance): bool;
}
