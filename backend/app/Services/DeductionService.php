<?php

namespace App\Services;

use App\DataTransferObjects\DeductionDTO;
use App\Models\Deduction;
use App\Repositories\Contracts\DeductionRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class DeductionService
{
    public function __construct(
        protected DeductionRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching Deductions: '.$e->getMessage());
            throw $e;
        }
    }

    public function showEmployeeDeductions(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->showEmployeeDeductions($employeeId, $perpage);
        } catch (\Exception $e) {
            Log::error("Error fetching Deductions for Employee ID {$employeeId}: ".$e->getMessage());
            throw $e;
        }
    }

    public function showPayrollDeductions(int $payrollId, int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->showPayrollDeductions($payrollId, $perpage);
        } catch (\Exception $e) {
            Log::error("Error fetching Deductions for Payroll ID {$payrollId}: ".$e->getMessage());
            throw $e;
        }
    }

    public function create(DeductionDTO $dto): Deduction
    {
        try {
            $deduction = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'payroll',
                description: 'deduction_created',
                subject: $deduction,
                properties: [
                    'employee_id' => $deduction->employee_id,
                    'type' => $deduction->type,
                    'amount' => $deduction->amount,
                ]
            );

            Log::info('Deduction created successfully', [
                'id' => $deduction->id,
                'employee_id' => $deduction->employee_id,
                'type' => $deduction->type,
                'amount' => $deduction->amount,
            ]);

            return $deduction;
        } catch (\Exception $e) {
            Log::error('Error creating Deduction: '.$e->getMessage());
            throw $e;
        }
    }

    public function update(Deduction $deduction, DeductionDTO $dto): Deduction
    {
        try {
            $oldData = $deduction->only(['type', 'amount']);

            $updatedDeduction = $this->repository->update($deduction, $dto->toArray());

            $this->activityLogger->log(
                logName: 'payroll',
                description: 'deduction_updated',
                subject: $updatedDeduction,
                properties: [
                    'before' => $oldData,
                    'after' => $updatedDeduction->only(['type', 'amount']),
                ]
            );

            Log::info('Deduction updated successfully', [
                'id' => $updatedDeduction->id,
                'employee_id' => $updatedDeduction->employee_id,
                'type' => $updatedDeduction->type,
                'amount' => $updatedDeduction->amount,
            ]);

            return $updatedDeduction;
        } catch (\Exception $e) {
            Log::error('Error updating Deduction: '.$e->getMessage());
            throw $e;
        }
    }

    public function delete(Deduction $deduction): bool
    {
        try {
            $data = $deduction->only(['employee_id', 'type', 'amount']);

            $deleted = $this->repository->delete($deduction);

            $this->activityLogger->log(
                logName: 'payroll',
                description: 'deduction_deleted',
                subject: $deduction,
                properties: $data
            );

            Log::info('Deduction deleted successfully', [
                'id' => $deduction->id,
                'employee_id' => $deduction->employee_id,
                'type' => $deduction->type,
                'amount' => $deduction->amount,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error('Error deleting Deduction: '.$e->getMessage());
            throw $e;
        }
    }
}
