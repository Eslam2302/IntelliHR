<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ExpenseDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use App\Services\ExpenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ExpenseController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ExpenseService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-expenses', only: ['index']),
            new Middleware('permission:view-expense', only: ['show']),
            new Middleware('permission:create-expense', only: ['store']),
            new Middleware('permission:edit-expense', only: ['update']),
            new Middleware('permission:delete-expense', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of all expenses.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $expenses = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => ExpenseResource::collection($expenses),
            'meta' => [
                'current_page' => $expenses->currentPage(),
                'per_page' => $expenses->perPage(),
                'total' => $expenses->total(),
                'last_page' => $expenses->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created expense in the database.
     */
    public function store(ExpenseRequest $request): JsonResponse
    {
        $dto = ExpenseDTO::fromRequest($request);
        $expense = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense created successfully',
            'data' => new ExpenseResource($expense),
        ], 201);
    }

    /**
     * Display the specified expense.
     *
     * @param  Expense  $expense
     */
    public function show(int $expenseId): JsonResponse
    {
        $expense = $this->service->show($expenseId);

        return response()->json([
            'status' => 'success',
            'data' => new ExpenseResource($expense),
        ], 200);
    }

    /**
     * Update the specified expense in storage.
     */
    public function update(ExpenseRequest $request, Expense $expense): JsonResponse
    {
        $dto = ExpenseDTO::fromRequest($request);
        $updatedExpense = $this->service->update($expense, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense updated successfully',
            'data' => new ExpenseResource($updatedExpense),
        ], 200);
    }

    /**
     * Remove the specified expense from storage.
     */
    public function destroy(Expense $expense): JsonResponse
    {
        $this->service->delete($expense);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense deleted successfully',
        ], 200);
    }

    /**
     * Display a paginated list of expenses for a specific employee.
     */
    public function employeeExpenses(int $employeeId): JsonResponse
    {
        $perPage = request('per_page', 10);
        $expenses = $this->service->getEmployeeExpenses($employeeId, $perPage);

        return response()->json([
            'status' => 'success',
            'data' => ExpenseResource::collection($expenses),
        ], 200);
    }
}
