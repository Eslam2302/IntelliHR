<?php

namespace App\Repositories\Contracts;

use App\Models\AssetAssignment;
use Illuminate\Pagination\LengthAwarePaginator;

interface AssetAssignmentRepositoryInterface
{
    /**
     * Retrieve a paginated list of asset assignments.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve an asset assignment by its ID.
     *
     * @param int $assignmentId
     * @return AssetAssignment
     */
    public function show(int $assignmentId): AssetAssignment;

    /**
     * Create a new asset assignment.
     *
     * @param array $data
     * @return AssetAssignment
     */
    public function create(array $data): AssetAssignment;

    /**
     * Update the specified asset assignment.
     *
     * @param AssetAssignment $assignment
     * @param array $data
     * @return AssetAssignment
     */
    public function update(AssetAssignment $assignment, array $data): AssetAssignment;

    /**
     * Delete the specified asset assignment.
     *
     * @param AssetAssignment $assignment
     * @return bool
     */
    public function delete(AssetAssignment $assignment): bool;
}