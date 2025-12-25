<?php

namespace App\Services;

use App\DataTransferObjects\ExpenseDTO;
use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ExpenseService
{
    public function __construct(
        protected ExpenseRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve all expenses with optional filters.
     *
     * @return mixed
     *
     * @throws \Exception
     */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (\Exception $e) {
            Log::error('Error fetching Expenses: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve an expense by ID.
     *
     * @throws \Exception
     */
    public function show(int $id): Expense
    {
        try {
            return $this->repository->show($id);
        } catch (\Exception $e) {
            Log::error("Error fetching Expense ID {$id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new expense using the provided DTO.
     *
     * @throws \Exception
     */
    public function create(ExpenseDTO $dto): Expense
    {
        try {
            $data = $dto->toArray();

            if (! isset($data['status'])) {
                $data['status'] = 'pending';
            }

            // Handle receipt file upload
            if ($dto->receipt_path instanceof \Illuminate\Http\UploadedFile) {
                $data['receipt_path'] = $dto->receipt_path->store('receipts', 'public');
            }

            $expense = $this->repository->create($data);

            $this->activityLogger->log(
                logName: 'expense',
                description: 'expense_created',
                subject: $expense,
                properties: [
                    'employee_id' => $expense->employee_id,
                    'amount' => $expense->amount,
                    'category_id' => $expense->category_id,
                    'expense_date' => $expense->expense_date,
                    'status' => $expense->status,
                ]
            );

            Log::info('Expense created successfully', [
                'id' => $expense->id,
                'amount' => $expense->amount,
                'employee_id' => $expense->employee_id,
            ]);

            return $expense;
        } catch (\Exception $e) {
            Log::error('Error creating Expense: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given expense using the provided DTO.
     *
     * @throws \Exception
     */
    public function update(Expense $expense, ExpenseDTO $dto): Expense
    {
        try {
            $oldData = $expense->only([
                'amount',
                'expense_date',
                'category_id',
                'status',
                'notes',
            ]);

            $data = $dto->toArray();

            // Handle receipt file upload if provided
            if ($dto->receipt_path instanceof \Illuminate\Http\UploadedFile) {
                // Delete old file if exists
                if ($expense->receipt_path) {
                    Storage::disk('public')->delete($expense->receipt_path);
                }
                $data['receipt_path'] = $dto->receipt_path->store('receipts', 'public');
            }

            $updated = $this->repository->update($expense, $data);

            $this->activityLogger->log(
                logName: 'expense',
                description: 'expense_updated',
                subject: $updated,
                properties: [
                    'before' => $oldData,
                    'after' => $updated->only([
                        'amount',
                        'expense_date',
                        'category_id',
                        'status',
                        'notes',
                    ]),
                ]
            );

            Log::info('Expense updated successfully', [
                'id' => $updated->id,
                'amount' => $updated->amount,
                'employee_id' => $updated->employee_id,
            ]);

            return $updated;
        } catch (\Exception $e) {
            Log::error("Error updating Expense ID {$expense->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given expense instance.
     *
     * @throws \Exception
     */
    public function delete(Expense $expense): bool
    {
        try {
            $data = $expense->only([
                'employee_id',
                'amount',
                'expense_date',
                'category_id',
                'status',
                'notes',
            ]);

            // Delete receipt file if exists
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }

            $deleted = $this->repository->delete($expense);

            $this->activityLogger->log(
                logName: 'expense',
                description: 'expense_deleted',
                subject: $expense,
                properties: $data
            );

            Log::info('Expense deleted successfully', [
                'id' => $expense->id,
                'amount' => $expense->amount,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Expense ID {$expense->id}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Get paginated expenses for a specific employee.
     */
    public function getEmployeeExpenses(int $employeeId, int $perPage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getByEmployee($employeeId, $perPage);
        } catch (\Exception $e) {
            Log::error("Error fetching expenses for Employee ID {$employeeId}: ".$e->getMessage());
            throw $e;
        }
    }
}
