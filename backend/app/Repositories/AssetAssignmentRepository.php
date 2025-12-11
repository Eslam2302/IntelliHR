<?php

namespace App\Repositories;

use App\Models\AssetAssignment;
use App\Repositories\Contracts\AssetAssignmentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetAssignmentRepository implements AssetAssignmentRepositoryInterface
{
    public function __construct(
        protected AssetAssignment $model
    ) {}

    /**
     * Get paginated list of asset assignments.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['asset', 'employee'])
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get an asset assignment by ID.
     *
     * @param int $assignmentId
     * @return AssetAssignment
     */
    public function show(int $assignmentId): AssetAssignment
    {
        return $this->model->findOrFail($assignmentId);
    }

    /**
     * Create a new asset assignment.
     *
     * @param array $data
     * @return AssetAssignment
     */
    public function create(array $data): AssetAssignment
    {
        return $this->model->create($data)->load(['asset', 'employee']);
    }

    /**
     * Update an existing asset assignment.
     *
     * @param AssetAssignment $assignment
     * @param array $data
     * @return AssetAssignment
     */
    public function update(AssetAssignment $assignment, array $data): AssetAssignment
    {
        $assignment->update($data);
        return $assignment->fresh();
    }

    /**
     * Delete an asset assignment.
     *
     * @param AssetAssignment $assignment
     * @return bool
     */
    public function delete(AssetAssignment $assignment): bool
    {
        return $assignment->delete();
    }
}