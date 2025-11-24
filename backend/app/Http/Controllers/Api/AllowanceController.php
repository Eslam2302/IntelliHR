<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AllowanceDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\AllowanceRequest;
use App\Http\Resources\AllowanceResource;
use App\Models\Allowance;
use App\Services\AllowanceService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class AllowanceController extends Controller
{

    public function __construct(
        protected AllowanceService $service
    ) {}

    /**
     * Display a paginated list of all allowances.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);
        $allowances = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => AllowanceResource::collection($allowances),
        ], 200);
    }

    /**
     * Display a paginated list of allowances for a specific employee.
     *
     * @param int $employeeId
     * @return JsonResponse
     */
    public function EmployeeAllowances(int $employeeId): JsonResponse
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
     *
     * @param int $payrollId
     * @return JsonResponse
     */
    public function PayrollAllowances(int $payrollId): JsonResponse
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
     *
     * @param AllowanceRequest $request
     * @return JsonResponse
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
     *
     * @param Allowance $allowance
     * @return JsonResponse
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
     *
     * @param AllowanceRequest $request
     * @param Allowance $allowance
     * @return JsonResponse
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
     *
     * @param Allowance $allowance
     * @return JsonResponse
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
