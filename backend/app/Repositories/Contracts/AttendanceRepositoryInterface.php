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

    /**
     * Get most recent attendances for an employee (for check-in page).
     *
     * @param int $employeeId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRecentByEmployee(int $employeeId, int $limit = 5);

    /**
     * Get attendances for a manager's team (employees where manager_id = $managerId).
     *
     * @param int $managerId
     * @param array $filters
     * @return LengthAwarePaginator
     */
    public function getAllForManager(int $managerId, array $filters = []): LengthAwarePaginator;
}
