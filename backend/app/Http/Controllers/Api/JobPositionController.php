<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\JobPositionsDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\JobPositionRequest;
use App\Http\Resources\JobPositionResource;
use App\Models\JobPosition;
use App\Services\JobPositionService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class JobPositionController extends Controller
{

    public function __construct(
        protected JobPositionService $jobPositionService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);
        $jobPoistion = $this->jobPositionService->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data'  => JobPositionResource::collection($jobPoistion),
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(JobPositionRequest $request): JsonResponse
    {
        $dto = JobPositionsDTO::fromRequest($request);
        $jobPosition = $this->jobPositionService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Job position created successfully.',
            'data' => new JobPositionResource($jobPosition),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(JobPosition $jobPosition): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new JobPositionResource($jobPosition),
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(JobPositionRequest $request, JobPosition $jobPosition): JsonResponse
    {
        $dto = JobPositionsDTO::fromRequest($request);
        $UpdateJobPosition = $this->jobPositionService->update($jobPosition, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Job postion updated successfully.',
            'data' => new JobPositionResource($UpdateJobPosition),
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobPosition $jobPosition): JsonResponse
    {
        $this->jobPositionService->delete($jobPosition);
        return response()->json([
            'status' => 'success',
            'message' => 'Job position deleted successfully.'
        ], 200);
    }
}