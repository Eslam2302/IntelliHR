<?php

namespace App\Repositories;

use App\Models\Allowance;
use App\Repositories\Contracts\AllowanceRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class AllowanceRepository implements AllowanceRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Allowance $model
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

    public function showEmployeeAllowances(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['employee', 'payroll'])
            ->where('employee_id', $employeeId)
            ->latest()
            ->paginate($perpage);
    }

    public function showPayrollAllowances(int $payrollId, int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['employee', 'payroll'])
            ->where('payroll_id', $payrollId)
            ->latest()
            ->paginate($perpage);
    }

    public function create(array $data): Allowance
    {
        return $this->model->create($data);
    }

    public function update(Allowance $allowance, array $data): Allowance
    {
        $allowance->update($data);

        return $allowance->fresh();
    }

    public function delete(Allowance $allowance): bool
    {
        return $allowance->delete();
    }

    /**
     * Get allowances where payroll_id IS NULL (pending)
     */
    public function getPendingForEmployeeMonth(int $employeeId)
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->whereNull('payroll_id')
            ->get();
    }

    /**
     * Mark allowances as processed by adding payroll_id
     */
    public function markAsProcessed(array $allowanceIds, int $payrollId)
    {
        return $this->model
            ->whereIn('id', $allowanceIds)
            ->update(['payroll_id' => $payrollId]);
    }
}
