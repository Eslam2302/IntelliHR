<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\DataTransferObjects\EmployeeDTO;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Http\JsonResponse;

class EmployeeController extends Controller implements HasMiddleware
{
    public function __construct(protected EmployeeService $employeeService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-employees|Super Admin', only: ['index']),
            new Middleware('permission:view-employee|Super Admin', only: ['show']),
            new Middleware('permission:create-employee|Super Admin', only: ['store']),
            new Middleware('permission:edit-employee|Super Admin', only: ['update']),
            new Middleware('permission:delete-employee|Super Admin', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        try {
            $perPage = request('per_page', 10);
            $employees = $this->employeeService->getAllPaginated($perPage);

            return response()->json([
                'status' => 'success',
                'data' => EmployeeResource::collection($employees),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'per_page' => $employees->perPage(),
                    'total' => $employees->total(),
                    'last_page' => $employees->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch employees.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        try {
            $dto = EmployeeDTO::fromStoreRequest($request);
            $employee = $this->employeeService->create($dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Employee created successfully.',
                'data' => new EmployeeResource($employee),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create employee.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function show(Employee $employee): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => new EmployeeResource($employee->load(['department', 'manager', 'user'])),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch employee.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        try {
            $dto = EmployeeDTO::fromUpdateRequest($request);
            $updatedEmployee = $this->employeeService->update($employee, $dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Employee updated successfully.',
                'data' => new EmployeeResource($updatedEmployee),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update employee.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    public function destroy(Employee $employee): JsonResponse
    {
        try {
            $this->employeeService->delete($employee);

            return response()->json([
                'status' => 'success',
                'message' => 'Employee deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete employee.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}