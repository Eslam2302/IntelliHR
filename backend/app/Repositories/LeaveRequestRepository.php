<?php

namespace App\Repositories;

use App\Models\LeaveRequest;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;

class LeaveRequestRepository implements LeaveRequestRepositoryInterface
{
    /**
     * Inject LeaveRequest model
     */
    public function __construct(
        protected LeaveRequest $model
    ) {}

    /**
     * Create a new leave request in database.
     *
     * @param array $data
     * @return LeaveRequest
     */
    public function create(array $data): LeaveRequest
    {
        return $this->model->create($data);
    }

    /**
     * Find a leave request by its ID.
     *
     * @param int $id
     * @return LeaveRequest
     */
    public function findById(int $id): LeaveRequest
    {
        return $this->model->with('employee.manager')->findOrFail($id);
    }

    /**
     * Update the status of a leave request.
     *
     * @param LeaveRequest $request
     * @param array $data
     * @return LeaveRequest
     */
    public function updateStatus(LeaveRequest $request, array $data): LeaveRequest
    {
        $request->update($data);
        return $request;
    }

    /**
     * Check overlapping leave requests for an employee.
     *
     * @param int $employeeId
     * @param string $start
     * @param string $end
     * @return bool
     */
    public function checkOverlap(int $employeeId, string $start, string $end): bool
    {
        return $this->model->where('employee_id', $employeeId)
            ->whereIn('status', ['pending', 'manager_approved', 'hr_approved'])
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('start_date', [$start, $end])
                    ->orWhereBetween('end_date', [$start, $end])
                    ->orWhereRaw('? BETWEEN start_date AND end_date', [$start])
                    ->orWhereRaw('? BETWEEN start_date AND end_date', [$end]);
            })
            ->exists();
    }

    /**
     * Get all leave requests of an employee with optional filters.
     *
     * @param int $employeeId
     * @param array $filters
     * @return Collection
     */
    public function getByEmployee(int $employeeId, array $filters = []): Collection
    {
        $query = $this->model->where('employee_id', $employeeId)
            ->with(['type', 'manager', 'hr']);

        if (!empty($filters['year'])) {
            $query->whereYear('start_date', $filters['year']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get();
    }

    /**
     * Get all leave requests of employees under a specific manager
     */
    public function getByManager(int $managerId, array $filters = []): Collection
    {
        $query = $this->model->whereHas('employee', function ($q) use ($managerId) {
            $q->where('manager_id', $managerId);
        })->with(['employee', 'type', 'manager', 'hr']);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('start_date', $filters['year']);
        }

        return $query->get();
    }
}
