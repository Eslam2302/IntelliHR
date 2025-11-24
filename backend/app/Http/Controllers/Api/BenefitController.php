<?php

namespace App\Http\Controllers\api;

use App\DataTransferObjects\BenefitDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\BenefitRequest;
use App\Http\Resources\BenefitResource;
use App\Models\Benefit;
use App\Services\BenefitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BenefitController extends Controller
{
    public function __construct(
        protected BenefitService $service
    ) {}

    /**
     * Display a paginated list of all benefits.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage =  request('per_page', 10);
        $benefits = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => BenefitResource::collection($benefits),
        ], 200);
    }

    /**
     * Display a paginated list of benefits for a specific employee.
     *
     * @param int $employeeId
     * @return JsonResponse
     */
    public function employeeBenefits(int $employeeId): JsonResponse
    {
        $perpage = request('per_page', 10);
        $benefits = $this->service->showEmployeeBenefits($employeeId, $perpage);
        return response()->json([
            'status' => 'success',
            'data' => BenefitResource::collection($benefits),
        ], 200);
    }

    /**
     * Store a newly created benefit in the database.
     *
     * @param BenefitRequest $request
     * @return JsonResponse
     */
    public function store(BenefitRequest $request): JsonResponse
    {
        $dto = BenefitDTO::fromRequest($request);
        $benefit = $this->service->create($dto);
        return response()->json([
            'status' => 'success',
            'message' => 'Benefit created successfully.',
            'data' => new BenefitResource($benefit),
        ], 201);
    }

    /**
     * Display the specified benefit.
     *
     * @param Benefit $benefit
     * @return JsonResponse
     */
    public function show(Benefit $benefit): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new BenefitResource($benefit),
        ], 200);
    }

    /**
     * Update the specified benefit in the database.
     *
     * @param BenefitRequest $request
     * @param Benefit $benefit
     * @return JsonResponse
     */
    public function update(BenefitRequest $request, Benefit $benefit): JsonResponse
    {
        $dto = BenefitDTO::fromRequest($request);
        $updatedBenefit = $this->service->update($benefit, $dto);
        return response()->json([
            'status' => 'success',
            'message' => 'Benefit updated successfully.',
            'data' => new BenefitResource($updatedBenefit),
        ], 200);
    }

    /**
     * Remove the specified benefit from the database.
     *
     * @param Benefit $benefit
     * @return JsonResponse
     */
    public function destroy(Benefit $benefit): JsonResponse
    {
        $this->service->delete($benefit);
        return response()->json([
            'status' => 'success',
            'message' => 'Benefit deleted successfully.',
        ], 200);
    }
}
