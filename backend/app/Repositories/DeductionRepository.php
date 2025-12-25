<?php

namespace App\Repositories;

use App\Models\Deduction;
use App\Repositories\Contracts\DeductionRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class DeductionRepository implements DeductionRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Deduction $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['employee', 'payroll']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'type', 'amount', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'payroll.year', 'payroll.month', 'payroll.payment_status'],
            ['id', 'type', 'amount', 'created_at', 'updated_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    public function showEmployeeDeductions(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['employee', 'payroll'])
            ->where('employee_id', $employeeId)
            ->latest()
            ->paginate($perpage);
    }

    public function showPayrollDeductions(int $payrollId, int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['employee', 'payroll'])
            ->where('payroll_id', $payrollId)
            ->latest()
            ->paginate($perpage);
    }

    public function create(array $data): Deduction
    {
        return $this->model->create($data);
    }

    public function update(Deduction $deduction, array $data): Deduction
    {
        $deduction->update($data);

        return $deduction->fresh();
    }

    public function delete(Deduction $deduction): bool
    {
        return $deduction->delete();
    }

    /**
     * Get deductions where payroll_id IS NULL (pending)
     */
    public function getPendingForEmployeeMonth(int $employeeId)
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->whereNull('payroll_id')
            ->get();
    }

    /**
     * Mark deductions as processed by adding payroll_id
     */
    public function markAsProcessed(array $deductionsIds, int $payrollId)
    {
        return $this->model
            ->whereIn('id', $deductionsIds)
            ->update(['payroll_id' => $payrollId]);
    }
}
