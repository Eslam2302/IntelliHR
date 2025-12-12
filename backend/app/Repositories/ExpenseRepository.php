<?php

namespace App\Repositories;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseRepository implements ExpenseRepositoryInterface
{
    public function __construct(
        protected Expense $model
    ) {}

    /**
     * Get paginated list of expenses with relations.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with(['employee', 'category'])
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get an expense by ID with relations.
     *
     * @param int $id
     * @return Expense
     */
    public function show(int $id): Expense
    {
        return $this->model->with(['employee', 'category'])->findOrFail($id);
    }

    /**
     * Create a new expense.
     *
     * @param array $data
     * @return Expense
     */
    public function create(array $data): Expense
    {
        return $this->model->create($data)->load(['employee', 'category']);
    }

    /**
     * Update an existing expense.
     *
     * @param Expense $expense
     * @param array $data
     * @return Expense
     */
    public function update(Expense $expense, array $data): Expense
    {
        $expense->update($data);
        return $expense->fresh()->load(['employee', 'category']);
    }

    /**
     * Delete an expense.
     *
     * @param Expense $expense
     * @return bool
     */
    public function delete(Expense $expense): bool
    {
        return $expense->delete();
    }

    /**
     * Retrieve paginated list of expenses for a specific employee.
     *
     * @param int $employeeId
     * @param int $perPage
     * @return LengthAwarePaginator
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
