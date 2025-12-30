<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\EvaluationCycleDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\EvaluationCycleRequest;
use App\Http\Resources\EvaluationCycleResource;
use App\Models\EvaluationCycle;
use App\Services\EvaluationCycleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EvaluationCycleController extends Controller implements HasMiddleware
{
    public function __construct(protected EvaluationCycleService $evaluationCycleService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-evaluation-cycles', only: ['index']),
            new Middleware('permission:view-evaluation-cycle', only: ['show']),
            new Middleware('permission:create-evaluation-cycle', only: ['store']),
            new Middleware('permission:edit-evaluation-cycle', only: ['update']),
            new Middleware('permission:delete-evaluation-cycle', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $evaluationCycles = $this->evaluationCycleService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => EvaluationCycleResource::collection($evaluationCycles),
            'meta' => [
                'current_page' => $evaluationCycles->currentPage(),
                'per_page' => $evaluationCycles->perPage(),
                'total' => $evaluationCycles->total(),
                'last_page' => $evaluationCycles->lastPage(),
            ],
        ]);
    }

    public function store(EvaluationCycleRequest $request): JsonResponse
    {
        $dto = EvaluationCycleDTO::fromRequest($request);
        $evaluationCycle = $this->evaluationCycleService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Evaluation cycle created successfully.',
            'data' => new EvaluationCycleResource($evaluationCycle),
        ], 201);
    }

    public function show(EvaluationCycle $evaluationCycle): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new EvaluationCycleResource($evaluationCycle->load(['creator', 'reviews'])),
        ], 200);
    }

    public function update(EvaluationCycleRequest $request, EvaluationCycle $evaluationCycle): JsonResponse
    {
        $dto = EvaluationCycleDTO::fromRequest($request);
        $updatedEvaluationCycle = $this->evaluationCycleService->update($evaluationCycle, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Evaluation cycle updated successfully.',
            'data' => new EvaluationCycleResource($updatedEvaluationCycle),
        ], 200);
    }

    public function destroy(EvaluationCycle $evaluationCycle): JsonResponse
    {
        $this->evaluationCycleService->delete($evaluationCycle);

        return response()->json([
            'status' => 'success',
            'message' => 'Evaluation cycle deleted successfully.',
        ], 200);
    }
}

