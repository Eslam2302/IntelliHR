<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\GoalDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\GoalRequest;
use App\Http\Resources\GoalResource;
use App\Models\Goal;
use App\Services\GoalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class GoalController extends Controller implements HasMiddleware
{
    public function __construct(protected GoalService $goalService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-goals', only: ['index']),
            new Middleware('permission:view-goal', only: ['show']),
            new Middleware('permission:create-goal', only: ['store']),
            new Middleware('permission:edit-goal', only: ['update']),
            new Middleware('permission:delete-goal', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $goals = $this->goalService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => GoalResource::collection($goals),
            'meta' => [
                'current_page' => $goals->currentPage(),
                'per_page' => $goals->perPage(),
                'total' => $goals->total(),
                'last_page' => $goals->lastPage(),
            ],
        ]);
    }

    public function store(GoalRequest $request): JsonResponse
    {
        $dto = GoalDTO::fromRequest($request);
        $goal = $this->goalService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal created successfully.',
            'data' => new GoalResource($goal),
        ], 201);
    }

    public function show(Goal $goal): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new GoalResource($goal->load(['employee', 'evaluationCycle', 'setBy', 'progressUpdates'])),
        ], 200);
    }

    public function update(GoalRequest $request, Goal $goal): JsonResponse
    {
        $dto = GoalDTO::fromRequest($request);
        $updatedGoal = $this->goalService->update($goal, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal updated successfully.',
            'data' => new GoalResource($updatedGoal),
        ], 200);
    }

    public function destroy(Goal $goal): JsonResponse
    {
        $this->goalService->delete($goal);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal deleted successfully.',
        ], 200);
    }
}

