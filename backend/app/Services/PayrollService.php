<?php

namespace App\Services;

use App\DataTransferObjects\PayrollDTO;
use App\Models\Payroll;
use App\Repositories\Contracts\PayrollRepositoryInterface;
use Illuminate\Support\Facades\Log;

class PayrollService
{
    public function __construct(
        protected PayrollRepositoryInterface $repository
    ) {}

    public function getAllPaginated(int $perpage = 10)
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Payrolls: ' . $e->getMessage());
            throw $e;
        }
    }

    public function create(PayrollDTO $dto): Payroll
    {
        try {
            // 1) Check duplicate payroll
            if ($this->repository->existsForPeriod(
                $dto->employee_id,
                $dto->year,
                $dto->month
            )) {
                throw new \Exception("Payroll for this employee and period already exists.");
            }

            // Calculate net pay
            $data = $dto->toArray();
            $data['net_pay'] = $this->repository->calculateNetPay(
                $data['basic_salary'],
                $data['allowances'],
                $data['deductions']
            );

            $payroll = $this->repository->create($data);

            Log::info("Payroll created successfully", [
                'id' => $payroll->id,
                'employee_id' => $payroll->employee_id,
                'year' => $payroll->year,
                'month' => $payroll->month,
            ]);

            return $payroll;
        } catch (\Exception $e) {
            Log::error("Error creating payroll: " . $e->getMessage(), [
                'payload' => $dto->toArray()
            ]);
            throw $e;
        }
    }

    public function update(Payroll $payroll, PayrollDTO $dto): Payroll
    {
        try {
            // Recalculate net pay
            $data = $dto->toArray();
            $data['net_pay'] = $this->repository->calculateNetPay(
                $data['basic_salary'],
                $data['allowances'],
                $data['deductions']
            );

            $updatedPayroll = $this->repository->update($payroll, $data);

            Log::info("Payroll updated successfully", [
                'id' => $updatedPayroll->id,
                'employee_id' => $updatedPayroll->employee_id,
                'year' => $updatedPayroll->year,
                'month' => $updatedPayroll->month,
            ]);

            return $updatedPayroll;
        } catch (\Exception $e) {
            Log::error("Error updating payroll: " . $e->getMessage(), [
                'payroll_id' => $payroll->id,
                'payload' => $dto->toArray(),
            ]);
            throw $e;
        }
    }

    public function delete(Payroll $payroll): bool
    {
        try {
            $result = $this->repository->delete($payroll);

            Log::info("Payroll deleted", [
                'id' => $payroll->id
            ]);

            return $result;
        } catch (\Exception $e) {
            Log::error("Error deleting payroll: " . $e->getMessage(), [
                'id' => $payroll->id
            ]);
            throw $e;
        }
    }

    public function getByEmployee(int $employeeId)
    {
        return $this->repository->getByEmployee($employeeId);
    }

    public function getByMonth(int $year, int $month)
    {
        return $this->repository->getByMonth($year, $month);
    }

    /**
     * Check if payrolls exist for specific year + month
     */
    public function existForMonth(int $year, int $month): bool
    {
        return $this->repository->existForMonth($year, $month);
    }
}
