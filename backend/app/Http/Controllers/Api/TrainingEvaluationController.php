<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TrainingEvaluationService;
use App\Http\Requests\TrainingEvaluationRequest;
use App\DataTransferObjects\TrainingEvaluationDTO;
use App\Http\Resources\TrainingEvaluationResource;
use App\Models\TrainingEvaluation;
use Illuminate\Http\JsonResponse;

class TrainingEvaluationController extends Controller
{
    public function __construct(protected TrainingEvaluationService $service) {}

    /**
     * List paginated training evaluations
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);
        $evaluations = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => TrainingEvaluationResource::collection($evaluations),
        ], 200);
    }

    /**
     * Store a new training evaluation
     */
    public function store(TrainingEvaluationRequest $request): JsonResponse
    {
        $dto = TrainingEvaluationDTO::fromRequest($request);
        $evaluation = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Evaluation created successfully',
            'data' => new TrainingEvaluationResource($evaluation),
        ], 201);
    }

    /**
     * Show a specific training evaluation
     */
    public function show(TrainingEvaluation $evaluation): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new TrainingEvaluationResource($evaluation),
        ], 200);
    }

    /**
     * Update a training evaluation
     */
    public function update(TrainingEvaluationRequest $request, TrainingEvaluation $evaluation): JsonResponse
    {
        $dto = TrainingEvaluationDTO::fromRequest($request);
        $updated = $this->service->update($evaluation, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Evaluation updated successfully',
            'data' => new TrainingEvaluationResource($updated),
        ], 200);
    }

    /**
     * Delete a training evaluation
     */
    public function destroy(TrainingEvaluation $evaluation): JsonResponse
    {
        $this->service->delete($evaluation);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Evaluation deleted successfully',
        ], 200);
    }
}
