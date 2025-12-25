<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ExpenseCategoryDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseCategoryRequest;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\ExpenseCategory;
use App\Services\ExpenseCategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ExpenseCategoryController extends Controller implements HasMiddleware
{
    public function __construct(
        protected ExpenseCategoryService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-expense-categories', only: ['index']),
            new Middleware('permission:view-expense-category', only: ['show']),
            new Middleware('permission:create-expense-category', only: ['store']),
            new Middleware('permission:edit-expense-category', only: ['update']),
            new Middleware('permission:delete-expense-category', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of all expense categories.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $categories = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => ExpenseCategoryResource::collection($categories),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
                'last_page' => $categories->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created expense category in the database.
     */
    public function store(ExpenseCategoryRequest $request): JsonResponse
    {
        $dto = ExpenseCategoryDTO::fromRequest($request);
        $category = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense category created successfully',
            'data' => new ExpenseCategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified expense category.
     */
    public function show(ExpenseCategory $category): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new ExpenseCategoryResource($category),
        ], 200);
    }

    /**
     * Update the specified expense category in storage.
     */
    public function update(ExpenseCategoryRequest $request, ExpenseCategory $category): JsonResponse
    {
        $dto = ExpenseCategoryDTO::fromRequest($request);
        $updatedCategory = $this->service->update($category, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense category updated successfully',
            'data' => new ExpenseCategoryResource($updatedCategory),
        ], 200);
    }

    /**
     * Remove the specified expense category from storage.
     */
    public function destroy(ExpenseCategory $category): JsonResponse
    {
        $this->service->delete($category);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense category deleted successfully',
        ], 200);
    }
}
