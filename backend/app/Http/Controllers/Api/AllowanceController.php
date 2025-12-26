<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AllowanceDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\AllowanceRequest;
use App\Http\Resources\AllowanceResource;
use App\Models\Allowance;
use App\Services\AllowanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AllowanceController extends Controller implements HasMiddleware
{
    public function __construct(
        protected AllowanceService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-allowances', only: ['index', 'EmployeeAllowances', 'PayrollAllowances']),
            new Middleware('permission:view-allowance', only: ['show']),
            new Middleware('permission:create-allowance', only: ['store']),
            new Middleware('permission:edit-allowance', only: ['update']),
            new Middleware('permission:delete-allowance', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of all allowances.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $allowances = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => AllowanceResource::collection($allowances),
            'meta' => [
                'current_page' => $allowances->currentPage(),
                'per_page' => $allowances->perPage(),
                'total' => $allowances->total(),
                'last_page' => $allowances->lastPage(),
            ],
        ], 200);
    }

    /**
     * Display a paginated list of allowances for a specific employee.
     */
    public function employeeAllowances(int $employeeId): JsonResponse
    {
        $perpage = request('per_page', 10);
        $allowances = $this->service->showEmployeeAllowances($employeeId, $perpage);

        return response()->json([
            'status' => 'success',
            'data' => AllowanceResource::collection($allowances),
        ], 200);
    }

    /**
     * Display a paginated list of allowances for a specific payroll.
     */
    public function payrollAllowances(int $payrollId): JsonResponse
    {
        $perpage = request('per_page', 10);
        $allowances = $this->service->showPayrollAllowances($payrollId, $perpage);

        return response()->json([
            'status' => 'success',
            'data' => AllowanceResource::collection($allowances),
        ], 200);
    }

    /**
     * Store a newly created allowance in the database.
     */
    public function store(AllowanceRequest $request): JsonResponse
    {
        $dto = AllowanceDTO::fromRequest($request);
        $allowance = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Allowance created successfully',
            'data' => new AllowanceResource($allowance),
        ], 201);
    }

    /**
     * Display the specified allowance.
     */
    public function show(Allowance $allowance): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new AllowanceResource($allowance),
        ], 200);
    }

    /**
     * Update the specified allowance in storage.
     */
    public function update(AllowanceRequest $request, Allowance $allowance): JsonResponse
    {
        $dto = AllowanceDTO::fromRequest($request);
        $updatedAllowance = $this->service->update($allowance, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Allowance updated successfully',
            'data' => new AllowanceResource($updatedAllowance),
        ], 200);
    }

    /**
     * Remove the specified allowance from storage.
     */
    public function destroy(Allowance $allowance): JsonResponse
    {
        $this->service->delete($allowance);

        return response()->json([
            'status' => 'success',
            'message' => 'Allowance deleted successfully',
        ], 200);
    }
}
