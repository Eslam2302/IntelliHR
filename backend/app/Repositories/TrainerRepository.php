<?php

namespace App\Repositories;

use App\Models\Trainer;
use App\Repositories\Contracts\TrainerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class TrainerRepository implements TrainerRepositoryInterface
{
    public function __construct(
        protected Trainer $model
    ) {}

    /**
     * Get paginated list of trainers.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with('employee')
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get a trainer by ID.
     *
     * @param int $trainerId
     * @return Trainer
     */
    public function show(int $trainerId): Trainer
    {
        return $this->model->findOrFail($trainerId);
    }

    /**
     * Create a new trainer.
     *
     * @param array $data
     * @return Trainer
     */
    public function create(array $data): Trainer
    {
        return $this->model->create($data)
            ->load('employee');
    }

    /**
     * Update an existing trainer.
     *
     * @param Trainer $trainer
     * @param array $data
     * @return Trainer
     */
    public function update(Trainer $trainer, array $data): Trainer
    {
        $trainer->update($data);
        return $trainer->fresh();
    }

    /**
     * Delete a trainer.
     *
     * @param Trainer $trainer
     * @return bool
     */
    public function delete(Trainer $trainer): bool
    {
        return $trainer->delete();
    }
}