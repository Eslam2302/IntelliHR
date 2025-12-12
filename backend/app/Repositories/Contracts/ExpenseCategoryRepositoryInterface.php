<?php

namespace App\Repositories\Contracts;

use App\Models\ExpenseCategory;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExpenseCategoryRepositoryInterface
{
    /**
     * Retrieve a paginated list of expense categories.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve an expense category by its ID.
     *
     * @param int $id
     * @return ExpenseCategory
     */
    public function show(int $id): ExpenseCategory;

    /**
     * Create a new expense category record.
     *
     * @param array $data
     * @return ExpenseCategory
     */
    public function create(array $data): ExpenseCategory;

    /**
     * Update the specified expense category.
     *
     * @param ExpenseCategory $category
     * @param array $data
     * @return ExpenseCategory
     */
    public function update(ExpenseCategory $category, array $data): ExpenseCategory;

    /**
     * Delete the specified expense category.
     *
     * @param ExpenseCategory $category
     * @return bool
     */
    public function delete(ExpenseCategory $category): bool;
}