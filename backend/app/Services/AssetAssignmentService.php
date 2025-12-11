<?php

namespace App\Services;

use App\DataTransferObjects\AssetAssignmentDTO;
use App\Models\AssetAssignment;
use App\Repositories\Contracts\AssetAssignmentRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AssetAssignmentService
{
    public function __construct(
        protected AssetAssignmentRepositoryInterface $repository
    ) {}

    /**
     * Retrieve paginated list of asset assignments.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Asset Assignments: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve an asset assignment by ID.
     *
     * @param int $assignmentId
     * @return AssetAssignment
     * @throws \Exception
     */
    public function show(int $assignmentId): AssetAssignment
    {
        try {
            return $this->repository->show($assignmentId);
        } catch (\Exception $e) {
            Log::error("Error fetching Asset Assignment ID {$assignmentId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new asset assignment using the provided DTO.
     *
     * @param AssetAssignmentDTO $dto
     * @return AssetAssignment
     * @throws \Exception
     */
    public function create(AssetAssignmentDTO $dto): AssetAssignment
    {
        try {
            $assignment = $this->repository->create($dto->toArray());

            Log::info("Asset Assignment created successfully", [
                'id' => $assignment->id,
                'asset_id' => $assignment->asset_id,
                'employee_id' => $assignment->employee_id,
            ]);

            return $assignment;
        } catch (\Exception $e) {
            Log::error('Error creating Asset Assignment: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given asset assignment using the provided DTO.
     *
     * @param AssetAssignment $assignment
     * @param AssetAssignmentDTO $dto
     * @return AssetAssignment
     * @throws \Exception
     */
    public function update(AssetAssignment $assignment, AssetAssignmentDTO $dto): AssetAssignment
    {
        try {
            $updatedAssignment = $this->repository->update($assignment, $dto->toArray());

            Log::info("Asset Assignment updated successfully", [
                'id' => $updatedAssignment->id,
                'asset_id' => $updatedAssignment->asset_id,
                'employee_id' => $updatedAssignment->employee_id,
            ]);

            return $updatedAssignment;
        } catch (\Exception $e) {
            Log::error("Error updating Asset Assignment ID {$assignment->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given asset assignment instance.
     *
     * @param AssetAssignment $assignment
     * @return bool
     * @throws \Exception
     */
    public function delete(AssetAssignment $assignment): bool
    {
        try {
            $deleted = $this->repository->delete($assignment);

            Log::info("Asset Assignment deleted successfully", [
                'id' => $assignment->id,
                'asset_id' => $assignment->asset_id,
                'employee_id' => $assignment->employee_id,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Asset Assignment ID {$assignment->id}: " . $e->getMessage());
            throw $e;
        }
    }
}