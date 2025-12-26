<?php

namespace App\Repositories;

use App\Models\Payroll;
use App\Repositories\Contracts\PayrollRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class PayrollRepository implements PayrollRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Payroll $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('employee');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'payment_status', 'month', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'employee.employee_status'],
            ['id', 'employee_id', 'payment_status', 'month', 'year', 'created_at', 'deleted_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Create new Payroll
     */
    public function create(array $data): Payroll
    {
        return $this->model->create($data);
    }

    /**
     * Update existing payroll
     */
    public function update(Payroll $payroll, array $data): Payroll
    {
        $payroll->update($data);

        return $payroll->fresh();
    }

    /**
     * Delete payroll
     */
    public function delete(Payroll $payroll): bool
    {
        return $payroll->delete();
    }

    /**
     * Payrolls for one employee
     */
    public function getByEmployee(int $employeeId): Collection
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->get();
    }

    /**
     * Payrolls for specific year & month
     */
    public function getByMonth(int $year, int $month): Collection
    {
        return $this->model
            ->where('year', $year)
            ->where('month', $month)
            ->get();
    }

    /**
     * Check if payrolls exist for specific year + month
     */
    public function existForMonth(int $year, int $month): bool
    {
        return $this->model
            ->where('year', $year)
            ->where('month', $month)
            ->exists();
    }

    /**
     * Check if payroll exists for period
     */
    public function existsForPeriod(int $employeeId, int $year, int $month): bool
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->where('year', $year)
            ->where('month', $month)
            ->exists();
    }

    /**
     * Calculate net pay
     */
    public function calculateNetPay(float $basic, float $allowances, float $deductions): float
    {
        return ($basic + $allowances) - $deductions;
    }
}
