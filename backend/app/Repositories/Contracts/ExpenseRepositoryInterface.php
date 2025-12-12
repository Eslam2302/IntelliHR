<?php

namespace App\Repositories\Contracts;

use App\Models\Expense;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExpenseRepositoryInterface
{
    /**
     * Retrieve a paginated list of expenses.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve an expense by its ID.
     *
     * @param int $id
     * @return Expense
     */
    public function show(int $id): Expense;

    /**
     * Create a new expense record.
     *
     * @param array $data
     * @return Expense
     */
    public function create(array $data): Expense;

    /**
     * Update the specified expense.
     *
     * @param Expense $expense
     * @param array $data
     * @return Expense
     */
    public function update(Expense $expense, array $data): Expense;

    /**
     * Delete the specified expense.
     *
     * @param Expense $expense
     * @return bool
     */
    public function delete(Expense $expense): bool;

    /**
     * Retrieve paginated list of expenses for a specific employee.
     *
     * @param int $employeeId
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getByEmployee(int $employeeId, int $perPage = 10): LengthAwarePaginator;
}
