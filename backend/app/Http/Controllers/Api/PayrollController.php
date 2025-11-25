<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\DataTransferObjects\PayrollDTO;
use App\Http\Requests\PayrollRequest;
use App\Http\Resources\PayrollResource;
use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;

class PayrollController extends Controller
{

    public function __construct(
        protected PayrollService $service
    ) {}

    /**
     * Display a paginated list of all allowances.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);

        $payrolls = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => PayrollResource::collection($payrolls),
        ], 200);
    }

    /**
     * Store a newly created allowance in the database.
     *
     * @param PayrollRequest $request
     * @return JsonResponse
     */
    public function store(PayrollRequest $request): JsonResponse
    {
        $dto = PayrollDTO::fromRequest($request);
        $payroll = $this->service->create($dto);
        return response()->json([
            'status' => 'success',
            'message'   => 'Payroll created successfully',
            'data' => new PayrollResource($payroll),
        ], 201);
    }

    /**
     * Display the specified allowance.
     *
     * @param Payroll $payroll
     * @return JsonResponse
     */
    public function show(Payroll $payroll): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new PayrollResource($payroll),
        ], 200);
    }

    /**
     * Update the specified allowance in storage.
     *
     * @param PayrollRequest $request
     * @param Payroll $payroll
     * @return JsonResponse
     */
    public function update(PayrollRequest $request, Payroll $payroll): JsonResponse
    {
        $dto = PayrollDTO::fromRequest($request);
        $updatedPayroll = $this->service->update($payroll, $dto);
        return response()->json([
            'status' => 'success',
            'message'   => 'Payroll updated successfully',
            'data' => new PayrollResource($updatedPayroll),
        ], 200);
    }

    /**
     * Remove the specified allowance from storage.
     *
     * @param Payroll $payroll
     * @return JsonResponse
     */
    public function destroy(Payroll $payroll): JsonResponse
    {
        $this->service->delete($payroll);
        return response()->json([
            'status' => 'success',
            'message'   => 'Payroll deleted successfully',
        ], 200);
    }


    /**
     * Payrolls for one employee
     * @param int $employeeId
     * @return JsonResponse
     */
    public function employeePayrolls(int $employeeId): JsonResponse
    {
        $payrolls = $this->service->getByEmployee($employeeId);

        return response()->json([
            'status' => 'success',
            'data' => PayrollResource::collection($payrolls),
        ], 200);
    }

    /**
     * Payrolls for specific year & month
     * @param int $year
     * @param int $month
     * @return JsonResponse
     */
    public function monthPayrolls(int $year,int $month): JsonResponse
    {
        $payrolls = $this->service->getByMonth($year, $month);

        return response()->json([
            'status' => 'success',
            'data' => PayrollResource::collection($payrolls),
        ], 200);
    }
}