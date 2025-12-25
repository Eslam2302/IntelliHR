<?php

namespace App\Repositories;

use App\Models\Interview;
use App\Repositories\Contracts\InterviewRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class InterviewRepository implements InterviewRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(protected Interview $model) {}

    /**
     * Get paginated list of interviews.
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['applicant', 'interviewer']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['status', 'applicant.first_name', 'applicant.last_name', 'applicant.email', 'applicant.phone', 'applicant.status', 'interviewer.first_name', 'interviewer.last_name', 'interviewer.personal_email', 'interviewer.phone'],
            ['id', 'status', 'scheduled_at', 'created_at'],
            'scheduled_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a single interview by ID.
     */
    public function show(int $interviewId): Interview
    {
        return $this->model
            ->with(['applicant', 'interviewer'])
            ->findOrFail($interviewId);
    }

    /**
     * Create a new interview.
     */
    public function create(array $data): Interview
    {
        return $this->model->create($data)->load(['applicant', 'interviewer']);
    }

    /**
     * Update an existing interview.
     */
    public function update(Interview $interview, array $data): Interview
    {
        $interview->update($data);

        return $interview->fresh()->load(['applicant', 'interviewer']);
    }

    /**
     * Delete an interview.
     */
    public function delete(Interview $interview): bool
    {
        return $interview->delete();
    }
}
