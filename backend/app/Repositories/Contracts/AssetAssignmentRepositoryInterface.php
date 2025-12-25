<?php

namespace App\Repositories\Contracts;

use App\Models\AssetAssignment;
use Illuminate\Pagination\LengthAwarePaginator;

interface AssetAssignmentRepositoryInterface
{
    /**
     * Retrieve a paginated list of asset assignments.
     *
     * @param  int  $perpage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve an asset assignment by its ID.
     */
    public function show(int $assignmentId): AssetAssignment;

    /**
     * Create a new asset assignment.
     */
    public function create(array $data): AssetAssignment;

    /**
     * Update the specified asset assignment.
     */
    public function update(AssetAssignment $assignment, array $data): AssetAssignment;

    /**
     * Delete the specified asset assignment.
     */
    public function delete(AssetAssignment $assignment): bool;
}
