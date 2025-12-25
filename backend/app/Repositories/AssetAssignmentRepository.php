<?php

namespace App\Repositories;

use App\Models\AssetAssignment;
use App\Repositories\Contracts\AssetAssignmentRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetAssignmentRepository implements AssetAssignmentRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected AssetAssignment $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['asset', 'employee']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['asset_id', 'employee_id', 'asset.name', 'asset.serial_number', 'asset.status', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone'],
            ['id', 'asset_id', 'employee_id', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get an asset assignment by ID.
     */
    public function show(int $assignmentId): AssetAssignment
    {
        return $this->model->findOrFail($assignmentId);
    }

    /**
     * Create a new asset assignment.
     */
    public function create(array $data): AssetAssignment
    {
        return $this->model->create($data)->load(['asset', 'employee']);
    }

    /**
     * Update an existing asset assignment.
     */
    public function update(AssetAssignment $assignment, array $data): AssetAssignment
    {
        $assignment->update($data);

        return $assignment->fresh();
    }

    /**
     * Delete an asset assignment.
     */
    public function delete(AssetAssignment $assignment): bool
    {
        return $assignment->delete();
    }
}
