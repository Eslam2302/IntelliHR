<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\EmployeeDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EmployeeController extends Controller implements HasMiddleware
{
    public function __construct(protected EmployeeService $employeeService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-employees', only: ['index']),
            new Middleware('permission:view-employee', only: ['show']),
            new Middleware('permission:create-employee', only: ['store']),
            new Middleware('permission:edit-employee', only: ['update']),
            new Middleware('permission:delete-employee', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $employees = $this->employeeService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => EmployeeResource::collection($employees),
            'meta' => [
                'current_page' => $employees->currentPage(),
                'per_page' => $employees->perPage(),
                'total' => $employees->total(),
                'last_page' => $employees->lastPage(),
            ],
        ]);
    }

    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $dto = EmployeeDTO::fromStoreRequest($request);
        $employee = $this->employeeService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee created successfully.',
            'data' => new EmployeeResource($employee),
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new EmployeeResource($employee->load(['department', 'manager', 'user'])),
        ], 200);
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $dto = EmployeeDTO::fromUpdateRequest($request);
        $updatedEmployee = $this->employeeService->update($employee, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee updated successfully.',
            'data' => new EmployeeResource($updatedEmployee),
        ], 200);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->employeeService->delete($employee);

        return response()->json([
            'status' => 'success',
            'message' => 'Employee deleted successfully.',
        ], 200);
    }
}
