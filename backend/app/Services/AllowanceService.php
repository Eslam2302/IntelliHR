<?php

namespace App\Services;

use App\DataTransferObjects\AllowanceDTO;
use App\Models\Allowance;
use App\Repositories\Contracts\AllowanceRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AllowanceService
{
    public function __construct(
        protected AllowanceRepositoryInterface $repository
    ) {}

    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Allowances: ' . $e->getMessage());
            throw $e;
        }
    }

    public function showEmployeeAllowances(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->showEmployeeAllowances($employeeId, $perpage);
        } catch (\Exception $e) {
            Log::error("Error fetching Allowances for Employee ID {$employeeId}: " . $e->getMessage());
            throw $e;
        }
    }

    public function showPayrollAllowances(int $payrollId, int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->showPayrollAllowances($payrollId, $perpage);
        } catch (\Exception $e) {
            Log::error("Error fetching Allowances for Payroll ID {$payrollId}: " . $e->getMessage());
            throw $e;
        }
    }

    public function create(AllowanceDTO $dto): Allowance
    {
        try {
            $allowance = $this->repository->create($dto->toArray());

            Log::info("Allowance created successfully", [
                'id' => $allowance->id,
                'employee_id' => $allowance->employee_id,
                'type' => $allowance->type,
                'amount' => $allowance->amount,
            ]);

            return $allowance;
        } catch (\Exception $e) {
            Log::error('Error creating Allowance: ' . $e->getMessage());
            throw $e;
        }
    }

    public function update(Allowance $allowance, AllowanceDTO $dto): Allowance
    {
        try {
            $updatedAllowance = $this->repository->update($allowance, $dto->toArray());

            Log::info("Allowance updated successfully", [
                'id' => $updatedAllowance->id,
                'employee_id' => $updatedAllowance->employee_id,
                'type' => $updatedAllowance->type,
                'amount' => $updatedAllowance->amount,
            ]);

            return $updatedAllowance;
        } catch (\Exception $e) {
            Log::error('Error updating Allowance: ' . $e->getMessage());
            throw $e;
        }
    }

    public function delete(Allowance $allowance): bool
    {
        try {
            $deleted = $this->repository->delete($allowance);

            Log::info("Allowance deleted successfully", [
                'id' => $allowance->id,
                'employee_id' => $allowance->employee_id,
                'type' => $allowance->type,
                'amount' => $allowance->amount,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error('Error deleting Allowance: ' . $e->getMessage());
            throw $e;
        }
    }
}