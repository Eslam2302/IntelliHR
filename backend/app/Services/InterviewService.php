<?php

namespace App\Services;

use App\DataTransferObjects\InterviewDTO;
use App\Models\Interview;
use App\Repositories\Contracts\InterviewRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\Log;

class InterviewService
{
    public function __construct(
        protected InterviewRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Get all interviews with optional filters.
     *
     * @return mixed
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching interviews: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get a single interview by ID.
     */
    public function show(int $interviewId): Interview
    {
        try {
            return $this->repository->show($interviewId);
        } catch (Exception $e) {
            Log::error("Error fetching interview ID {$interviewId}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new interview using DTO.
     */
    public function create(InterviewDTO $dto): Interview
    {
        try {
            $interview = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'interview',
                description: 'interview_created',
                subject: $interview,
                properties: [
                    'applicant_id' => $interview->applicant_id,
                    'interviewer_id' => $interview->interviewer_id,
                    'scheduled_at' => $interview->scheduled_at,
                    'status' => $interview->status,
                ]
            );

            Log::info('Interview created successfully', ['id' => $interview->id]);

            return $interview;
        } catch (Exception $e) {
            Log::error('Error creating interview: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update an interview using DTO.
     */
    public function update(Interview $interview, InterviewDTO $dto): Interview
    {
        try {
            $oldData = $interview->only([
                'applicant_id',
                'interviewer_id',
                'scheduled_at',
                'score',
                'notes',
                'status',
            ]);

            $updated = $this->repository->update($interview, $dto->toArray());

            $this->activityLogger->log(
                logName: 'interview',
                description: 'interview_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after' => $updated->only([
                        'applicant_id',
                        'interviewer_id',
                        'scheduled_at',
                        'score',
                        'notes',
                        'status',
                    ]),
                ]
            );

            Log::info('Interview updated successfully', ['id' => $updated->id]);

            return $updated;
        } catch (Exception $e) {
            Log::error("Error updating interview ID {$interview->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete an interview.
     */
    public function delete(Interview $interview): bool
    {
        try {
            $data = $interview->only([
                'applicant_id',
                'interviewer_id',
                'scheduled_at',
                'score',
                'notes',
                'status',
            ]);

            $deleted = $this->repository->delete($interview);

            $this->activityLogger->log(
                logName: 'interview',
                description: 'interview_deleted',
                subject: $interview,
                properties: $data
            );

            Log::info('Interview deleted successfully', ['id' => $interview->id]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting interview ID {$interview->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
