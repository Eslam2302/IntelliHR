<?php

namespace App\Repositories\Contracts;

use App\Models\Expense;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExpenseRepositoryInterface
{
    /**
     * Retrieve a paginated list of expenses.
     *
     * @param  int  $perpage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve an expense by its ID.
     */
    public function show(int $id): Expense;

    /**
     * Create a new expense record.
     */
    public function create(array $data): Expense;

    /**
     * Update the specified expense.
     */
    public function update(Expense $expense, array $data): Expense;

    /**
     * Delete the specified expense.
     */
    public function delete(Expense $expense): bool;

    /**
     * Retrieve paginated list of expenses for a specific employee.
     */
    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator;
}
