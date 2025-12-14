<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\HiringStageService;
use Illuminate\Http\JsonResponse;
use App\DataTransferObjects\HiringStageDTO;
use App\Http\Resources\HiringStageResource;
use App\Http\Requests\HiringStageRequest;
use App\Models\HiringStage;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class HiringStageController extends Controller implements HasMiddleware
{
    /**
     * HiringStageController constructor.
     *
     * @param HiringStageService $service
     */
    public function __construct(
        protected HiringStageService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-hiring-stages', only: ['index','getByJobPost']),
            new Middleware('permission:view-hiring-stage', only: ['show']),
            new Middleware('permission:create-hiring-stage', only: ['store']),
            new Middleware('permission:edit-hiring-stage', only: ['update']),
            new Middleware('permission:delete-hiring-stage', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of hiring stages.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);
        $stages = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => HiringStageResource::collection($stages),
        ], 200);
    }

    /**
     * Create a new hiring stage.
     *
     * @param HiringStageRequest $request
     * @return JsonResponse
     */
    public function store(HiringStageRequest $request): JsonResponse
    {
        $dto = HiringStageDTO::fromRequest($request);
        $stage = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Hiring Stage created successfully',
            'data' => new HiringStageResource($stage),
        ], 201);
    }

    /**
     * Get all hiring stages for a specific job post.
     *
     * @param int $jobPostId
     * @return JsonResponse
     */
    public function getByJobPost(int $jobPostId): JsonResponse
    {
        $stages = $this->service->getByJobPost($jobPostId);

        return response()->json([
            'status' => 'success',
            'data' => HiringStageResource::collection($stages),
        ], 200);
    }


    /**
     * Display a specific hiring stage.
     *
     * @param HiringStage $hiringStage
     * @return JsonResponse
     */
    public function show(HiringStage $hiringStage): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new HiringStageResource($hiringStage),
        ], 200);
    }

    /**
     * Update a specific hiring stage.
     *
     * @param HiringStageRequest $request
     * @param HiringStage $hiringStage
     * @return JsonResponse
     */
    public function update(HiringStageRequest $request, HiringStage $hiringStage): JsonResponse
    {
        $dto = HiringStageDTO::fromRequest($request);
        $updatedStage = $this->service->update($hiringStage, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Hiring Stage updated successfully',
            'data' => new HiringStageResource($updatedStage),
        ], 200);
    }

    /**
     * Delete a specific hiring stage.
     *
     * @param HiringStage $hiringStage
     * @return JsonResponse
     */
    public function destroy(HiringStage $hiringStage): JsonResponse
    {
        $this->service->delete($hiringStage);

        return response()->json([
            'status' => 'success',
            'message' => 'Hiring Stage deleted successfully',
        ], 200);
    }
}