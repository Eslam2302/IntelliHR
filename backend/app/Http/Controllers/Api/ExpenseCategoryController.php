<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\ExpenseCategoryDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\ExpenseCategoryRequest;
use App\Http\Resources\ExpenseCategoryResource;
use App\Models\ExpenseCategory;
use App\Services\ExpenseCategoryService;
use Illuminate\Http\JsonResponse;

class ExpenseCategoryController extends Controller
{
    public function __construct(
        protected ExpenseCategoryService $service
    ) {}

    /**
     * Display a paginated list of all expense categories.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);
        $categories = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => ExpenseCategoryResource::collection($categories),
        ], 200);
    }

    /**
     * Store a newly created expense category in the database.
     *
     * @param ExpenseCategoryRequest $request
     * @return JsonResponse
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
     *
     * @param ExpenseCategory $category
     * @return JsonResponse
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
     *
     * @param ExpenseCategoryRequest $request
     * @param ExpenseCategory $category
     * @return JsonResponse
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
     *
     * @param ExpenseCategory $category
     * @return JsonResponse
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