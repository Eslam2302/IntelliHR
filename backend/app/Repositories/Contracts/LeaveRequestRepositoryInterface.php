<?php

namespace App\Repositories\Contracts;

use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Collection;

interface LeaveRequestRepositoryInterface
{
    /**
     * Create a new leave request record in database.
     *
     * @param array $data
     * @return LeaveRequest
     */
    public function create(array $data): LeaveRequest;

    /**
     * Find a leave request by its ID.
     *
     * @param int $id
     * @return LeaveRequest
     */
    public function findById(int $id): LeaveRequest;

    /**
     * Update the status of a leave request.
     * Example: pending → manager_approved → hr_approved
     *
     * @param LeaveRequest $request
     * @param array $data
     * @return LeaveRequest
     */
    public function updateStatus(LeaveRequest $request, array $data): LeaveRequest;

    /**
     * Check if the employee has an overlapping leave request.
     * Prevents requesting multiple leaves for the same period.
     *
     * @param int $employeeId
     * @param string $start
     * @param string $end
     * @return bool
     */
    public function checkOverlap(int $employeeId, string $start, string $end): bool;

    /**
     * Get all leave requests of an employee, optionally filtered by year/status.
     *
     * @param int $employeeId
     * @param array|null $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByEmployee(int $employeeId, array $filters = []);

    /**
     * Get all leave requests of employees under a specific manager.
     * Optional filters: 'status', 'year'
     *
     * @param int $managerId
     * @param array|null $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByManager(int $managerId, array $filters = []): Collection;
}