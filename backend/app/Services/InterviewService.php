<?php

namespace App\Services;

use App\DataTransferObjects\InterviewDTO;
use App\Models\Interview;
use App\Repositories\Contracts\InterviewRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class InterviewService
{
    public function __construct(protected InterviewRepositoryInterface $repository) {}

    /**
     * Get paginated list of interviews.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching interviews: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a single interview by ID.
     *
     * @param int $interviewId
     * @return Interview
     */
    public function show(int $interviewId): Interview
    {
        try {
            return $this->repository->show($interviewId);
        } catch (\Exception $e) {
            Log::error("Error fetching interview ID {$interviewId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new interview using DTO.
     *
     * @param InterviewDTO $dto
     * @return Interview
     */
    public function create(InterviewDTO $dto): Interview
    {
        try {
            $interview = $this->repository->create($dto->toArray());
            Log::info("Interview created successfully", ['id' => $interview->id]);
            return $interview;
        } catch (\Exception $e) {
            Log::error('Error creating interview: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an interview using DTO.
     *
     * @param Interview $interview
     * @param InterviewDTO $dto
     * @return Interview
     */
    public function update(Interview $interview, InterviewDTO $dto): Interview
    {
        try {
            $updated = $this->repository->update($interview, $dto->toArray());
            Log::info("Interview updated successfully", ['id' => $updated->id]);
            return $updated;
        } catch (\Exception $e) {
            Log::error("Error updating interview ID {$interview->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an interview.
     *
     * @param Interview $interview
     * @return bool
     */
    public function delete(Interview $interview): bool
    {
        try {
            $deleted = $this->repository->delete($interview);
            Log::info("Interview deleted successfully", ['id' => $interview->id]);
            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting interview ID {$interview->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
