<?php

namespace App\Repositories;

use App\Models\TrainingSession;
use App\Repositories\Contracts\TrainingSessionRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainingSessionRepository implements TrainingSessionRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected TrainingSession $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['trainer.employee', 'department']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['title', 'description', 'trainer.employee.first_name', 'trainer.employee.last_name', 'trainer.employee.personal_email', 'trainer.employee.phone', 'department.name'],
            ['id', 'title', 'description', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a single training session by ID
     */
    public function show(int $id): TrainingSession
    {
        return $this->model
            ->with(['trainer.employee', 'department'])
            ->findOrFail($id);
    }

    /**
     * Create a new training session
     */
    public function create(array $data): TrainingSession
    {
        return $this->model->create($data)->load(['trainer.employee', 'department']);
    }

    /**
     * Update an existing training session
     */
    public function update(TrainingSession $trainingSession, array $data): TrainingSession
    {
        $trainingSession->update($data);

        return $trainingSession->fresh()->load(['trainer.employee', 'department']);
    }

    /**
     * Delete a training session
     */
    public function delete(TrainingSession $trainingSession): bool
    {
        return $trainingSession->delete();
    }
}
