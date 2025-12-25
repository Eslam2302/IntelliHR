<?php

namespace App\Repositories;

use App\Models\ExpenseCategory;
use App\Repositories\Contracts\ExpenseCategoryRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class ExpenseCategoryRepository implements ExpenseCategoryRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected ExpenseCategory $model
    ) {}

    /**
     * Get paginated list of expense categories.
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['name'],
            ['id', 'name', 'created_at', 'updated_at'],
            'name',
            'asc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get an expense category by ID.
     */
    public function show(int $id): ExpenseCategory
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Create a new expense category.
     */
    public function create(array $data): ExpenseCategory
    {
        return $this->model->create($data);
    }

    /**
     * Update an existing expense category.
     */
    public function update(ExpenseCategory $category, array $data): ExpenseCategory
    {
        $category->update($data);

        return $category->fresh();
    }

    /**
     * Delete an expense category.
     */
    public function delete(ExpenseCategory $category): bool
    {
        return $category->delete();
    }
}
