<?php

namespace App\Repositories;

use App\Models\ExpenseCategory;
use App\Repositories\Contracts\ExpenseCategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseCategoryRepository implements ExpenseCategoryRepositoryInterface
{
    public function __construct(
        protected ExpenseCategory $model
    ) {}

    /**
     * Get paginated list of expense categories.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get an expense category by ID.
     *
     * @param int $id
     * @return ExpenseCategory
     */
    public function show(int $id): ExpenseCategory
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a new expense category.
     *
     * @param array $data
     * @return ExpenseCategory
     */
    public function create(array $data): ExpenseCategory
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing expense category.
     *
     * @param ExpenseCategory $category
     * @param array $data
     * @return ExpenseCategory
     */
    public function update(ExpenseCategory $category, array $data): ExpenseCategory
    {
        $category->update($data);
        return $category->fresh();
    }

    /**
     * Delete an expense category.
     *
     * @param ExpenseCategory $category
     * @return bool
     */
    public function delete(ExpenseCategory $category): bool
    {
        return $category->delete();
    }
}
