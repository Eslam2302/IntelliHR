<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\PayrollDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\PayrollRequest;
use App\Http\Resources\PayrollResource;
use App\Jobs\ProcessPayrollJob;
use App\Models\Payroll;
use App\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PayrollController extends Controller implements HasMiddleware
{
    public function __construct(
        protected PayrollService $service,
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-payrolls', only: ['index', 'employeePayrolls', 'monthPayrolls']),
            new Middleware('permission:view-payroll', only: ['show']),
            new Middleware('permission:create-payroll', only: ['store', 'processPayroll']),
            new Middleware('permission:edit-payroll', only: ['update']),
            new Middleware('permission:delete-payroll', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of all allowances.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);

        $payrolls = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => PayrollResource::collection($payrolls),
            'meta' => [
                'current_page' => $payrolls->currentPage(),
                'per_page' => $payrolls->perPage(),
                'total' => $payrolls->total(),
                'last_page' => $payrolls->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created allowance in the database.
     */
    public function store(PayrollRequest $request): JsonResponse
    {
        $dto = PayrollDTO::fromRequest($request);
        $payroll = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Payroll created successfully',
            'data' => new PayrollResource($payroll),
        ], 201);
    }

    /**
     * Display the specified allowance.
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
     */
    public function update(PayrollRequest $request, Payroll $payroll): JsonResponse
    {
        $dto = PayrollDTO::fromRequest($request);
        $updatedPayroll = $this->service->update($payroll, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Payroll updated successfully',
            'data' => new PayrollResource($updatedPayroll),
        ], 200);
    }

    /**
     * Remove the specified allowance from storage.
     */
    public function destroy(Payroll $payroll): JsonResponse
    {
        $this->service->delete($payroll);

        return response()->json([
            'status' => 'success',
            'message' => 'Payroll deleted successfully',
        ], 200);
    }

    /**
     * Payrolls for one employee
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
     */
    public function monthPayrolls(int $year, int $month): JsonResponse
    {
        $payrolls = $this->service->getByMonth($year, $month);

        return response()->json([
            'status' => 'success',
            'data' => PayrollResource::collection($payrolls),
        ], 200);
    }

    /**
     * Trigger payroll processing for a specific month
     */
    public function processPayroll(Request $request): JsonResponse
    {
        if ($request->has(['year', 'month'])) {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot manually set year or month. Payroll always runs for the current month.',
            ], 400);
        }

        $year = now()->year;
        $month = now()->month;

        ProcessPayrollJob::dispatch($year, $month);

        return response()->json([
            'status' => 'success',
            'message' => "Payroll processing for {$year}-{$month} has been initiated.",
        ], 200);
    }
}
