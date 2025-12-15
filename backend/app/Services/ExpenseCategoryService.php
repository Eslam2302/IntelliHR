<?php

namespace App\Services;

use App\DataTransferObjects\ExpenseCategoryDTO;
use App\Models\ExpenseCategory;
use App\Repositories\Contracts\ExpenseCategoryRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class ExpenseCategoryService
{
    public function __construct(
        protected ExpenseCategoryRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve paginated list of expense categories.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error("Error fetching Expense Categories: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve an expense category by ID.
     *
     * @param int $id
     * @return ExpenseCategory
     * @throws \Exception
     */
    public function show(int $id): ExpenseCategory
    {
        try {
            return $this->repository->show($id);
        } catch (\Exception $e) {
            Log::error("Error fetching Expense Category ID {$id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new expense category using the provided DTO.
     *
     * @param ExpenseCategoryDTO $dto
     * @return ExpenseCategory
     * @throws \Exception
     */
    public function create(ExpenseCategoryDTO $dto): ExpenseCategory
    {
        try {
            $category = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'expenseCategory',
                description: 'expense_category_created',
                subject: $category,
                properties: [
                    'name' => $category->name,
                ]
            );

            Log::info("Expense Category created successfully", [
                'id' => $category->id,
                'name' => $category->name,
            ]);

            return $category;
        } catch (\Exception $e) {
            Log::error("Error creating Expense Category: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given expense category using the provided DTO.
     *
     * @param ExpenseCategory $category
     * @param ExpenseCategoryDTO $dto
     * @return ExpenseCategory
     * @throws \Exception
     */
    public function update(ExpenseCategory $category, ExpenseCategoryDTO $dto): ExpenseCategory
    {
        try {
            $oldData = $category->only(['name']);

            $updated = $this->repository->update($category, $dto->toArray());

            $this->activityLogger->log(
                logName: 'expenseCategory',
                description: 'expense_category_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after'  => $updated->only(['name']),
                ]
            );

            Log::info("Expense Category updated successfully", [
                'id' => $updated->id,
                'name' => $updated->name,
            ]);

            return $updated;
        } catch (\Exception $e) {
            Log::error("Error updating Expense Category ID {$category->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given expense category instance.
     *
     * @param ExpenseCategory $category
     * @return bool
     * @throws \Exception
     */
    public function delete(ExpenseCategory $category): bool
    {
        try {
            $data = $category->only(['name']);

            $deleted = $this->repository->delete($category);

            $this->activityLogger->log(
                logName: 'expenseCategory',
                description: 'expense_category_deleted',
                subject: $category,
                properties: $data
            );

            Log::info("Expense Category deleted successfully", [
                'id' => $category->id,
                'name' => $category->name,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Expense Category ID {$category->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
