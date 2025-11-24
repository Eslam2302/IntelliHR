<?php

namespace App\Services;

use App\DataTransferObjects\BenefitDTO;
use App\Models\Benefit;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class BenefitService
{
    public function __construct(
        protected BenefitRepositoryInterface $repository
    ) {}

    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Benefits: ' . $e->getMessage());
            throw $e;
        }
    }

    public function showEmployeeBenefits(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->showEmployeeBenefits($employeeId, $perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Employee Benefits: ' . $e->getMessage());
            throw $e;
        }
    }

    public function create(BenefitDTO $dto): Benefit
    {
        try {
            $benefit = $this->repository->create($dto->toArray());

            Log::info("Benefit created successfully", [
                'id' => $benefit->id,
                'employee_id' => $benefit->employee_id,
                'type' => $benefit->type,
            ]);
            return $benefit;
        } catch (\Exception $e) {
            Log::error('Error creating Benefit: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(Benefit $benefit, BenefitDTO $dto): Benefit
    {
        try {
            $updatedBenefit = $this->repository->update($benefit, $dto->toArray());

            Log::info("Benefit updated successfully", [
                'id' => $updatedBenefit->id,
                'employee_id' => $updatedBenefit->employee_id,
                'type' => $updatedBenefit->type,
            ]);
            return $updatedBenefit;
        } catch (\Exception $e) {
            Log::error('Error updating Benefit: ' . $e->getMessage());
            throw $e;
        }
    }

    public function delete(Benefit $benefit): bool
    {
        try {
            $deleted = $this->repository->delete($benefit);

            Log::info("Benefit deleted successfully", [
                'id' => $benefit->id,
                'employee_id' => $benefit->employee_id,
                'type' => $benefit->type,
            ]);
            return $deleted;
        } catch (\Exception $e) {
            Log::error('Error deleting Benefit: ' . $e->getMessage());
            throw $e;
        }
    }
}