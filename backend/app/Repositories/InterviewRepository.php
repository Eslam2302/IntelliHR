<?php

namespace App\Repositories;

use App\Models\Interview;
use App\Repositories\Contracts\InterviewRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class InterviewRepository implements InterviewRepositoryInterface
{
    public function __construct(protected Interview $model) {}

    /**
     * Get paginated list of interviews.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['applicant', 'interviewer'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get a single interview by ID.
     *
     * @param int $interviewId
     * @return Interview
     */
    public function show(int $interviewId): Interview
    {
        return $this->model
            ->with(['applicant', 'interviewer'])
            ->findOrFail($interviewId);
    }

    /**
     * Create a new interview.
     *
     * @param array $data
     * @return Interview
     */
    public function create(array $data): Interview
    {
        return $this->model->create($data)->load(['applicant', 'interviewer']);
    }

    /**
     * Update an existing interview.
     *
     * @param Interview $interview
     * @param array $data
     * @return Interview
     */
    public function update(Interview $interview, array $data): Interview
    {
        $interview->update($data);
        return $interview->fresh()->load(['applicant', 'interviewer']);
    }

    /**
     * Delete an interview.
     *
     * @param Interview $interview
     * @return bool
     */
    public function delete(Interview $interview): bool
    {
        return $interview->delete();
    }
}
