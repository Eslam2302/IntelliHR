<?php

namespace App\Services;

use App\DataTransferObjects\AssetAssignmentDTO;
use App\Models\AssetAssignment;
use App\Repositories\Contracts\AssetAssignmentRepositoryInterface;
use Illuminate\Support\Facades\Log;

class AssetAssignmentService
{
    public function __construct(
        protected AssetAssignmentRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve all asset assignments with optional filters.
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching Asset Assignments: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve an asset assignment by ID.
     *
     * @throws \Exception
     */
    public function show(int $assignmentId): AssetAssignment
    {
        try {
            return $this->repository->show($assignmentId);
        } catch (\Exception $e) {
            Log::error("Error fetching Asset Assignment ID {$assignmentId}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new asset assignment using the provided DTO.
     *
     * @throws \Exception
     */
    public function create(AssetAssignmentDTO $dto): AssetAssignment
    {
        try {
            $assignment = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'assetAssignment',
                description: 'asset_assignment_created',
                subject: $assignment,
                properties: [
                    'employee_id' => $assignment->employee_id,
                    'asset_id' => $assignment->asset_id,
                    'assined_date' => $assignment->assined_date,
                ]
            );

            Log::info('Asset Assignment created successfully', [
                'id' => $assignment->id,
                'asset_id' => $assignment->asset_id,
                'employee_id' => $assignment->employee_id,
            ]);

            return $assignment;
        } catch (\Exception $e) {
            Log::error('Error creating Asset Assignment: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given asset assignment using the provided DTO.
     *
     * @throws \Exception
     */
    public function update(AssetAssignment $assignment, AssetAssignmentDTO $dto): AssetAssignment
    {
        try {
            $oldData = $assignment->only([
                'asset_id',
                'employee_id',
                'assignd_date',
                'return_date',
            ]);

            $updatedAssignment = $this->repository->update($assignment, $dto->toArray());

            $this->activityLogger->log(
                logName: 'assetAssignment',
                description: 'asset_assignment_updated',
                subject: $updatedAssignment,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedAssignment->only([
                        'asset_id',
                        'employee_id',
                        'assignd_date',
                        'return_date',
                    ]),
                ]
            );

            Log::info('Asset Assignment updated successfully', [
                'id' => $updatedAssignment->id,
                'asset_id' => $updatedAssignment->asset_id,
                'employee_id' => $updatedAssignment->employee_id,
            ]);

            return $updatedAssignment;
        } catch (\Exception $e) {
            Log::error("Error updating Asset Assignment ID {$assignment->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given asset assignment instance.
     *
     * @throws \Exception
     */
    public function delete(AssetAssignment $assignment): bool
    {
        try {
            $data = $assignment->only([
                'asset_id',
                'employee_id',
                'assignd_date',
                'return_date',
            ]);

            $deleted = $this->repository->delete($assignment);

            $this->activityLogger->log(
                logName: 'assetAssignment',
                description: 'asset_assignment_deleted',
                subject: $assignment,
                properties: $data
            );

            Log::info('Asset Assignment deleted successfully', [
                'id' => $assignment->id,
                'asset_id' => $assignment->asset_id,
                'employee_id' => $assignment->employee_id,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Asset Assignment ID {$assignment->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
