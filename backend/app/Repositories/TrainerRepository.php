<?php

namespace App\Repositories;

use App\Models\Trainer;
use App\Repositories\Contracts\TrainerRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainerRepository implements TrainerRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Trainer $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('employee');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'name', 'email', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'employee.employee_status'],
            ['id', 'name', 'email', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a trainer by ID.
     */
    public function show(int $trainerId): Trainer
    {
        return $this->model->findOrFail($trainerId);
    }

    /**
     * Create a new trainer.
     */
    public function create(array $data): Trainer
    {
        return $this->model->create($data)
            ->load('employee');
    }

    /**
     * Update an existing trainer.
     */
    public function update(Trainer $trainer, array $data): Trainer
    {
        $trainer->update($data);

        return $trainer->fresh();
    }

    /**
     * Delete a trainer.
     */
    public function delete(Trainer $trainer): bool
    {
        return $trainer->delete();
    }
}
