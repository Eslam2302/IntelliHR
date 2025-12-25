<?php

namespace App\Repositories;

use App\Models\LeaveRequest;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class LeaveRequestRepository implements LeaveRequestRepositoryInterface
{
    use FilterQueryTrait;

    /**
     * Inject LeaveRequest model
     */
    public function __construct(
        protected LeaveRequest $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('employee.manager');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'status', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'employee.manager.first_name', 'employee.manager.last_name'],
            ['id', 'employee_id', 'status', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Create a new leave request in database.
     */
    public function create(array $data): LeaveRequest
    {
        return $this->model->create($data);
    }

    /**
     * Find a leave request by its ID.
     */
    public function findById(int $id): LeaveRequest
    {
        return $this->model->with('employee.manager')->findOrFail($id);
    }

    /**
     * Update the status of a leave request.
     */
    public function updateStatus(LeaveRequest $request, array $data): LeaveRequest
    {
        $request->update($data);

        return $request;
    }

    /**
     * Check overlapping leave requests for an employee.
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
     */
    public function getByEmployee(int $employeeId, array $filters = []): Collection
    {
        $query = $this->model->where('employee_id', $employeeId)
            ->with(['type', 'manager', 'hr']);

        if (! empty($filters['year'])) {
            $query->whereYear('start_date', $filters['year']);
        }

        if (! empty($filters['status'])) {
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

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['year'])) {
            $query->whereYear('start_date', $filters['year']);
        }

        return $query->get();
    }
}
