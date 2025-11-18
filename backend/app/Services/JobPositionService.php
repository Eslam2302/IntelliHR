<?php

namespace App\Services;

use App\DataTransferObjects\JobPositionsDTO;
use App\Models\JobPosition;
use App\Repositories\Contracts\JobPositionRepositoryInterface;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpParser\Node\Expr;

class JobPositionService
{
    public function __construct(
        protected JobPositionRepositoryInterface $repository
    ) {}

    /*
     * Get all paginated Job Poitions 10 per page
    */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (Exception $e) {
            Log::error('Error fetching Job Poitions: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create new Job position
     */
    public function create(JobPositionsDTO $dto): JobPosition
    {
        try {
            $jobPosition = $this->repository->create($dto->toArray());

            Log::info("Job position created successfully", [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);
            return $jobPosition;
        } catch (Exception $e) {
            Log::error('Error creating Job postion: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    /**
     * Update the existing position
     */
    public function update(JobPosition $jobPosition, JobPositionsDTO $dto): JobPosition
    {
        try {
            $updatedJobPosition = $this->repository->update($jobPosition, $dto->toArray());
            Log::info("Job position updated successfully:", [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);
            return $updatedJobPosition;
        } catch (Exception $e) {
            Log::error('Error updating job postion: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    /**
     * delete job position
     */
    public function delete(JobPosition $jobPosition): bool
    {
        try {
            $deletedJobPosition = $this->repository->delete($jobPosition);
            Log::info("Job position deleted successfully", [
                'id' => $jobPosition->id,
                'title' => $jobPosition->title,
                'grade' => $jobPosition->grade,
            ]);
            return $deletedJobPosition;
        } catch (Exception $e) {
            Log::error('Error deleting job postion: ' . $e->getMessage());
            throw $e;
        }
    }
}
