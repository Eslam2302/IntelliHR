<?php

namespace App\Repositories;

use App\Models\Applicant;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ApplicantRepository implements ApplicantRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(protected Applicant $model) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['job', 'currentStage', 'interviews']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['first_name', 'last_name', 'email', 'phone', 'status', 'job.title', 'job.status', 'currentStage.stage_name', 'interviews.status', 'interviews.score'],
            ['id', 'first_name', 'last_name', 'email', 'status', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
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
