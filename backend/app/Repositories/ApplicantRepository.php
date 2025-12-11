<?php

namespace App\Repositories;

use App\Models\Applicant;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ApplicantRepository implements ApplicantRepositoryInterface
{
    public function __construct(protected Applicant $model) {}

    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['job', 'currentStage', 'interviews'])
            ->latest()
            ->paginate($perPage);
    }

    public function show(int $applicantId): Applicant
    {
        return $this->model
            ->with(['job', 'currentStage', 'interviews'])
            ->findOrFail($applicantId);
    }

    public function create(array $data): Applicant
    {
        return $this->model->create($data)->load(['job', 'currentStage', 'interviews']);
    }

    public function update(Applicant $applicant, array $data): Applicant
    {
        $applicant->update($data);
        return $applicant->fresh()->load(['job', 'currentStage', 'interviews']);
    }

    public function delete(Applicant $applicant): bool
    {
        return $applicant->delete();
    }

    public function getByJobPost(int $jobPostId): Collection
    {
        return $this->model
            ->with(['currentStage', 'interviews'])
            ->where('job_id', $jobPostId)
            ->latest()
            ->get();
    }
}
