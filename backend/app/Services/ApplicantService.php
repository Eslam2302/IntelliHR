<?php

namespace App\Services;

use App\DataTransferObjects\ApplicantDTO;
use App\Models\Applicant;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use Exception;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Log;

class ApplicantService
{
    public function __construct(
        protected ApplicantRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching Applicants: '.$e->getMessage());
            throw $e;
        }
    }

    public function show(int $applicantId): Applicant
    {
        try {
            return $this->repository->show($applicantId);
        } catch (Exception $e) {
            Log::error("Error fetching Applicant ID {$applicantId}: ".$e->getMessage());
            throw $e;
        }
    }

    public function create(ApplicantDTO $dto): Applicant
    {
        try {
            $data = $dto->toArray();

            if (empty($data['current_stage_id'])) {
                $firstStage = \App\Models\JobPost::findOrFail($data['job_id'])
                    ->hiringStages()
                    ->orderBy('order')
                    ->first();

                $data['current_stage_id'] = $firstStage?->id;
            }

            $applicant = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_created',
                subject: $applicant,
                properties: [
                    'first_name' => $applicant->first_name,
                    'last_name' => $applicant->last_name,
                    'email' => $applicant->email,
                    'phone' => $applicant->phone,
                    'job_id' => $applicant->job_id,
                    'status' => $applicant->status,
                    'is_employee' => $applicant->is_employee,
                    'source' => $applicant->source,
                    'experience_years' => $applicant->experience_years,
                    'current_stage_id' => $applicant->current_stage_id,
                ]
            );

            Log::info('Applicant created successfully', [
                'id' => $applicant->id,
                'name' => $applicant->first_name.' '.$applicant->last_name,
                'job_id' => $applicant->job_id,
                'current_stage_id' => $applicant->current_stage_id,
            ]);

            return $applicant;
        } catch (Exception $e) {
            Log::error('Error creating Applicant: '.$e->getMessage());
            throw $e;
        }
    }

    public function update(Applicant $applicant, ApplicantDTO $dto): Applicant
    {
        try {
            $oldData = $applicant->only([
                'first_name',
                'last_name',
                'email',
                'phone',
                'job_id',
                'status',
                'is_employee',
                'source',
                'experience_years',
                'current_stage_id',
            ]);

            $updated = $this->repository->update($applicant, $dto->toArray());

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after' => $updated->only([
                        'first_name',
                        'last_name',
                        'email',
                        'phone',
                        'job_id',
                        'status',
                        'is_employee',
                        'source',
                        'experience_years',
                        'current_stage_id',
                    ]),
                ]
            );

            Log::info('Applicant updated successfully', ['id' => $updated->id]);

            return $updated;
        } catch (Exception $e) {
            Log::error("Error updating Applicant ID {$applicant->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function delete(Applicant $applicant): bool
    {
        try {
            $data = $applicant->only([
                'first_name',
                'last_name',
                'email',
                'phone',
                'job_id',
                'status',
                'is_employee',
                'source',
                'experience_years',
                'current_stage_id',
            ]);

            $deleted = $this->repository->delete($applicant);

            $this->activityLogger->log(
                logName: 'applicant',
                description: 'applicant_deleted',
                subject: $applicant,
                properties: $data
            );

            Log::info('Applicant deleted successfully', ['id' => $applicant->id]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting Applicant ID {$applicant->id}: ".$e->getMessage());
            throw $e;
        }
    }

    public function getByJobPost(int $jobPostId): Collection
    {
        return $this->repository->getByJobPost($jobPostId);
    }
}
