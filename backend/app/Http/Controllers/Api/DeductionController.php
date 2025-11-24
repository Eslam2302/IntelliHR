<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\DeductionDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\DeductionRequest;
use App\Http\Resources\DeductionResource;
use App\Models\Deduction;
use App\Services\DeductionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;


class DeductionController extends Controller
{

    public function __construct(
        protected DeductionService $service
    ) {}

    /**
     * Display a paginated list of all Deductions.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);
        $deductions = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => DeductionResource::collection($deductions),
        ], 200);
    }

    /**
     * Display a paginated list of Deductions for a specific employee.
     *
     * @param int $employeeId
     * @return JsonResponse
     */
    public function EmployeeDeductions(int $employeeId): JsonResponse
    {
        $perpage = request('per_page', 10);
        $deductions = $this->service->showEmployeeDeductions($employeeId, $perpage);
        return response()->json([
            'status' => 'success',
            'data' => DeductionResource::collection($deductions),
        ], 200);
    }

    /**
     * Display a paginated list of Deductions for a specific payroll.
     *
     * @param int $payrollId
     * @return JsonResponse
     */
    public function PayrollDeductions(int $payrollId): JsonResponse
    {
        $perpage = request('per_page', 10);
        $deductions = $this->service->showPayrollDeductions($payrollId, $perpage);
        return response()->json([
            'status' => 'success',
            'data' => DeductionResource::collection($deductions),
        ], 200);
    }

    /**
     * Store a newly created Deduction in the database.
     *
     * @param DeductionRequest $request
     * @return JsonResponse
     */
    public function store(DeductionRequest $request): JsonResponse
    {
        $dto = DeductionDTO::fromRequest($request);
        $deduction = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Deduction created successfully',
            'data' => new DeductionResource($deduction),
        ], 201);
    }

    /**
     * Display the specified Deduction.
     *
     * @param Deduction $deduction
     * @return JsonResponse
     */
    public function show(Deduction $deduction): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new DeductionResource($deduction),
        ], 200);
    }

    /**
     * Update the specified Deduction in storage.
     *
     * @param DeductionRequest $request
     * @param Deduction $deduction
     * @return JsonResponse
     */
    public function update(DeductionRequest $request, Deduction $deduction): JsonResponse
    {
        $dto = DeductionDTO::fromRequest($request);
        $updatedDeduction = $this->service->update($deduction, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Deduction updated successfully',
            'data' => new DeductionResource($updatedDeduction),
        ], 200);
    }

    /**
     * Remove the specified Deduction from storage.
     *
     * @param Deduction $deduction
     * @return JsonResponse
     */
    public function destroy(Deduction $deduction): JsonResponse
    {
        $this->service->delete($deduction);

        return response()->json([
            'status' => 'success',
            'message' => 'Deduction deleted successfully',
        ], 200);
    }
}
