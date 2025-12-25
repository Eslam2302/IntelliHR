<?php

namespace App\Repositories;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseRepository implements ExpenseRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Expense $model
    ) {}

    /**
     * Get paginated list of expenses with relations.
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with(['employee', 'category']);

        $query = $this->applyFilters(
            $query,
            $filters,
            ['employee_id', 'amount', 'status', 'employee.first_name', 'employee.last_name', 'employee.personal_email', 'employee.phone', 'category.name'],
            ['id', 'amount', 'status', 'created_at', 'updated_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get an expense by ID with relations.
     */
    public function show(int $id): Expense
    {
        return $this->model->with(['employee', 'category'])->findOrFail($id);
    }

    /**
     * Create a new expense.
     */
    public function create(array $data): Expense
    {
        return $this->model->create($data)->load(['employee', 'category']);
    }

    /**
     * Update an existing expense.
     */
    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);

        return $expense->fresh()->load(['employee', 'category']);
    }

    /**
     * Delete an expense.
     */
    public function delete(Expense $expense): bool
    {
        return $expense->delete();
    }

    /**
     * Retrieve paginated list of expenses for a specific employee.
     */
    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with('employee', 'category')
            ->where('employee_id', $employeeId)
            ->latest()
            ->paginate($perPage);
    }
}
