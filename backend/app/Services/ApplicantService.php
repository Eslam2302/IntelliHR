<?php

namespace App\Services;

use App\DataTransferObjects\ApplicantDTO;
use App\Models\Applicant;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Collection;

class ApplicantService
{
    public function __construct(protected ApplicantRepositoryInterface $repository) {}

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perPage);
        } catch (\Exception $e) {
            Log::error('Error fetching Applicants: ' . $e->getMessage());
            throw $e;
        }
    }

    public function show(int $applicantId): Applicant
    {
        try {
            return $this->repository->show($applicantId);
        } catch (\Exception $e) {
            Log::error("Error fetching Applicant ID {$applicantId}: " . $e->getMessage());
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
            Log::info("Applicant created successfully", [
                'id' => $applicant->id,
                'name' => $applicant->first_name . ' ' . $applicant->last_name,
                'job_id' => $applicant->job_id,
                'current_stage_id' => $applicant->current_stage_id,
            ]);
            
            return $applicant;
        } catch (\Exception $e) {
            Log::error("Error creating Applicant: " . $e->getMessage());
            throw $e;
        }
    }

    public function update(Applicant $applicant, ApplicantDTO $dto): Applicant
    {
        try {
            $updated = $this->repository->update($applicant, $dto->toArray());
            Log::info("Applicant updated successfully", ['id' => $updated->id]);
            return $updated;
        } catch (\Exception $e) {
            Log::error("Error updating Applicant ID {$applicant->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function delete(Applicant $applicant): bool
    {
        try {
            $deleted = $this->repository->delete($applicant);
            Log::info("Applicant deleted successfully", ['id' => $applicant->id]);
            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Applicant ID {$applicant->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function getByJobPost(int $jobPostId): Collection
    {
        return $this->repository->getByJobPost($jobPostId);
    }
}
