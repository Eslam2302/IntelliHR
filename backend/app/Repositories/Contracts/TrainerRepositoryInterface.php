<?php

namespace App\Repositories\Contracts;

use App\Models\Trainer;
use Illuminate\Pagination\LengthAwarePaginator;

interface TrainerRepositoryInterface
{
    /**
     * Retrieve a paginated list of trainers.
     *
     * @param  int  $perpage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve a trainer by its ID.
     */
    public function show(int $trainerId): Trainer;

    /**
     * Create a new trainer record.
     */
    public function create(array $data): Trainer;

    /**
     * Update the specified trainer.
     */
    public function update(Trainer $trainer, array $data): Trainer;

    /**
     * Delete the specified trainer.
     */
    public function delete(Trainer $trainer): bool;
}
