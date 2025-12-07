<?php

namespace App\Services;

use App\DataTransferObjects\TrainerDTO;
use App\Models\Trainer;
use App\Repositories\Contracts\TrainerRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class TrainerService
{
    public function __construct(
        protected TrainerRepositoryInterface $repository
    ) {}

    /**
     * Retrieve paginated list of trainers.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Trainers: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a trainer by ID.
     *
     * @param int $trainerId
     * @return Trainer
     * @throws \Exception
     */
    public function show(int $trainerId): Trainer
    {
        try {
            return $this->repository->show($trainerId);
        } catch (\Exception $e) {
            Log::error("Error fetching Trainer ID {$trainerId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new trainer using the provided DTO.
     *
     * @param TrainerDTO $dto
     * @return Trainer
     * @throws \Exception
     */
    public function create(TrainerDTO $dto): Trainer
    {
        try {
            $trainer = $this->repository->create($dto->toArray());

            Log::info("Trainer created successfully", [
                'id' => $trainer->id,
                'type' => $trainer->type,
                'employee_id' => $trainer->employee_id,
                'name' => $trainer->name,
                'email' => $trainer->email,
            ]);

            return $trainer;
        } catch (\Exception $e) {
            Log::error('Error creating Trainer: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given trainer using the provided DTO.
     *
     * @param Trainer $trainer
     * @param TrainerDTO $dto
     * @return Trainer
     * @throws \Exception
     */
    public function update(Trainer $trainer, TrainerDTO $dto): Trainer
    {
        try {
            $updatedTrainer = $this->repository->update($trainer, $dto->toArray());

            Log::info("Trainer updated successfully", [
                'id' => $updatedTrainer->id,
                'type' => $trainer->type,
                'employee_id' => $updatedTrainer->employee_id,
                'name' => $updatedTrainer->name,
                'email' => $updatedTrainer->email,
            ]);

            return $updatedTrainer;
        } catch (\Exception $e) {
            Log::error("Error updating Trainer ID {$trainer->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given trainer instance.
     *
     * @param Trainer $trainer
     * @return bool
     * @throws \Exception
     */
    public function delete(Trainer $trainer): bool
    {
        try {
            $deleted = $this->repository->delete($trainer);

            Log::info("Trainer deleted successfully", [
                'id' => $trainer->id,
                'type' => $trainer->type,
                'employee_id' => $trainer->employee_id,
                'name' => $trainer->name,
                'email' => $trainer->email,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Trainer ID {$trainer->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
