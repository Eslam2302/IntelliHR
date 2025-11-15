<?php

namespace App\Repositories\Contracts;

use App\Models\Attendance;
use Illuminate\Pagination\LengthAwarePaginator;

interface AttendanceRepositoryInterface
{
    public function getAllPaginatedForUser($user, int $perPage = 15): LengthAwarePaginator;

    public function findTodayByEmployee(int $employeeId): ?Attendance;

    public function create(array $data): Attendance;

    public function update(Attendance $attendance, array $data): Attendance;

    public function delete(Attendance $attendance): bool;
}