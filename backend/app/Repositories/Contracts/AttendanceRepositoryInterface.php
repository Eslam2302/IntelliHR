<?php

namespace App\Repositories\Contracts;

use App\Models\Attendance;
use Illuminate\Pagination\LengthAwarePaginator;

interface AttendanceRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function findTodayByEmployee(int $employeeId): ?Attendance;

    public function findByEmployeeAndDate(int $employeeId, string $date): ?Attendance;

    public function getEmployeeAttendanceStats(int $employeeId, ?string $startDate = null, ?string $endDate = null): array;

    public function create(array $data): Attendance;

    public function update(Attendance $attendance, array $data): Attendance;

    public function delete(Attendance $attendance): bool;

    public function find(int $id): ?Attendance;
}
