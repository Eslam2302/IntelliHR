<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\DepartmentDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use App\Services\DepartmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class DepartmentController extends Controller implements HasMiddleware
{
    public function __construct(
        protected DepartmentService $departmentService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-departments', only: ['index']),
            new Middleware('permission:view-department', only: ['show']),
            new Middleware('permission:create-department', only: ['store']),
            new Middleware('permission:edit-department', only: ['update']),
            new Middleware('permission:delete-department', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of departments
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $departments = $this->departmentService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => DepartmentResource::collection($departments),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
                'last_page' => $departments->lastPage(),
            ],
        ]);
    }

    /**
     * Store a newly created department
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $dto = DepartmentDTO::fromStoreRequest($request);
        $department = $this->departmentService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Department created successfully.',
            'data' => new DepartmentResource($department),
        ], 201);
    }

    /**
     * Display the specified department
     */
    public function show(Department $department): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new DepartmentResource($department),
        ], 200);
    }

    /**
     * Update the specified department
     */
    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $dto = DepartmentDTO::fromUpdateRequest($request);
        $updatedDepartment = $this->departmentService->update($department, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Department updated successfully.',
            'data' => new DepartmentResource($updatedDepartment),
        ], 200);
    }

    /**
     * Remove the specified department
     */
    public function destroy(Department $department): JsonResponse
    {
        $this->departmentService->delete($department);

        return response()->json([
            'status' => 'success',
            'message' => 'Department deleted successfully.',
        ], 200);
    }
}
