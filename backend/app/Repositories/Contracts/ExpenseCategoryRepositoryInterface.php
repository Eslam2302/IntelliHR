<?php

namespace App\Repositories\Contracts;

use App\Models\ExpenseCategory;
use Illuminate\Pagination\LengthAwarePaginator;

interface ExpenseCategoryRepositoryInterface
{
    /**
     * Retrieve a paginated list of expense categories.
     *
     * @param  int  $perpage
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve an expense category by its ID.
     */
    public function show(int $id): ExpenseCategory;

    /**
     * Create a new expense category record.
     */
    public function create(array $data): ExpenseCategory;

    /**
     * Update the specified expense category.
     */
    public function update(ExpenseCategory $category, array $data): ExpenseCategory;

    /**
     * Delete the specified expense category.
     */
    public function delete(ExpenseCategory $category): bool;
}
