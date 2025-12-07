<?php

namespace App\Repositories\Contracts;

use App\Models\Trainer;
use Illuminate\Pagination\LengthAwarePaginator;

interface TrainerRepositoryInterface
{
    /**
     * Retrieve a paginated list of trainers.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve a trainer by its ID.
     *
     * @param int $trainerId
     * @return Trainer
     */
    public function show(int $trainerId): Trainer;

    /**
     * Create a new trainer record.
     *
     * @param array $data
     * @return Trainer
     */
    public function create(array $data): Trainer;

    /**
     * Update the specified trainer.
     *
     * @param Trainer $trainer
     * @param array $data
     * @return Trainer
     */
    public function update(Trainer $trainer, array $data): Trainer;

    /**
     * Delete the specified trainer.
     *
     * @param Trainer $trainer
     * @return bool
     */
    public function delete(Trainer $trainer): bool;
}
