<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\BenefitDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\BenefitRequest;
use App\Http\Resources\BenefitResource;
use App\Models\Benefit;
use App\Services\BenefitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class BenefitController extends Controller implements HasMiddleware
{
    public function __construct(
        protected BenefitService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-benefits', only: ['index', 'employeeBenefits']),
            new Middleware('permission:view-benefit', only: ['show']),
            new Middleware('permission:create-benefit', only: ['store']),
            new Middleware('permission:edit-benefit', only: ['update']),
            new Middleware('permission:delete-benefit', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of all benefits.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $benefits = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => BenefitResource::collection($benefits),
            'meta' => [
                'current_page' => $benefits->currentPage(),
                'per_page' => $benefits->perPage(),
                'total' => $benefits->total(),
                'last_page' => $benefits->lastPage(),
            ],
        ], 200);
    }

    /**
     * Display a paginated list of benefits for a specific employee.
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
