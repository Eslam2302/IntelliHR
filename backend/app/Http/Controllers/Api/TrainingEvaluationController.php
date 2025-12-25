<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\TrainingEvaluationDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrainingEvaluationRequest;
use App\Http\Resources\TrainingEvaluationResource;
use App\Models\TrainingEvaluation;
use App\Services\TrainingEvaluationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TrainingEvaluationController extends Controller implements HasMiddleware
{
    public function __construct(protected TrainingEvaluationService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-training-evaluations', only: ['index']),
            new Middleware('permission:view-training-evaluation', only: ['show']),
            new Middleware('permission:create-training-evaluation', only: ['store']),
            new Middleware('permission:edit-training-evaluation', only: ['update']),
            new Middleware('permission:delete-training-evaluation', only: ['destroy']),
        ];
    }

    /**
     * List paginated training evaluations
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $evaluations = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => TrainingEvaluationResource::collection($evaluations),
            'meta' => [
                'current_page' => $evaluations->currentPage(),
                'per_page' => $evaluations->perPage(),
                'total' => $evaluations->total(),
                'last_page' => $evaluations->lastPage(),
            ],
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
