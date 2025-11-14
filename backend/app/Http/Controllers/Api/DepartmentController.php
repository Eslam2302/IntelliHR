<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CreateDepartmentDTO;
use App\DataTransferObjects\UpdateDepartmentDTO;
use App\Exceptions\DepartmentHasEmployeesException;
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
            new Middleware('permission:view-all-departments|Super Admin', only: ['index']),
            new Middleware('permission:view-department|Super Admin', only: ['show']),
            new Middleware('permission:create-department|Super Admin', only: ['store']),
            new Middleware('permission:edit-department|Super Admin', only: ['update']),
            new Middleware('permission:delete-department|Super Admin', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of departments
     */
    public function index(): JsonResponse
    {
        try {
            $perPage = request('per_page', 10);
            $departments = $this->departmentService->getAllPaginated((int) $perPage);

            return response()->json([
                'status' => 'success',
                'data' => DepartmentResource::collection($departments),
                'meta' => [
                    'current_page' => $departments->currentPage(),
                    'per_page' => $departments->perPage(),
                    'total' => $departments->total(),
                    'last_page' => $departments->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch departments.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created department
     */
    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        try {
            $dto = CreateDepartmentDTO::fromRequest($request);
            $department = $this->departmentService->create($dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Department created successfully.',
                'data' => new DepartmentResource($department),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create department.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Display the specified department
     */
    public function show(Department $department): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => new DepartmentResource($department),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch department.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified department
     */
    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        try {
            $dto = UpdateDepartmentDTO::fromRequest($request);
            $updatedDepartment = $this->departmentService->update($department, $dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Department updated successfully.',
                'data' => new DepartmentResource($updatedDepartment),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update department.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified department
     */
    public function destroy(Department $department): JsonResponse
    {
        try {
            $this->departmentService->delete($department);

            return response()->json([
                'status' => 'success',
                'message' => 'Department deleted successfully.'
            ], 200);
        } catch (DepartmentHasEmployeesException $e) {
            // Business logic exception - handled by exception itself
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete department.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
