<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\GoalProgressDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\GoalProgressRequest;
use App\Http\Resources\GoalProgressUpdateResource;
use App\Models\Goal;
use App\Models\GoalProgressUpdate;
use App\Services\GoalProgressUpdateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class GoalProgressUpdateController extends Controller implements HasMiddleware
{
    public function __construct(protected GoalProgressUpdateService $goalProgressUpdateService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-goal-progress-updates', only: ['index']),
            new Middleware('permission:view-goal-progress-update', only: ['show']),
            new Middleware('permission:create-goal-progress-update', only: ['store']),
            new Middleware('permission:edit-goal-progress-update', only: ['update']),
            new Middleware('permission:delete-goal-progress-update', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'goal_id']);
        $goalProgressUpdates = $this->goalProgressUpdateService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => GoalProgressUpdateResource::collection($goalProgressUpdates),
            'meta' => [
                'current_page' => $goalProgressUpdates->currentPage(),
                'per_page' => $goalProgressUpdates->perPage(),
                'total' => $goalProgressUpdates->total(),
                'last_page' => $goalProgressUpdates->lastPage(),
            ],
        ]);
    }

    public function store(GoalProgressRequest $request, Goal $goal): JsonResponse
    {
        $dto = GoalProgressDTO::fromRequest($request);
        $goalProgressUpdate = $this->goalProgressUpdateService->create($dto, $goal->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal progress update created successfully.',
            'data' => new GoalProgressUpdateResource($goalProgressUpdate),
        ], 201);
    }

    public function show(GoalProgressUpdate $goalProgressUpdate): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new GoalProgressUpdateResource($goalProgressUpdate->load(['goal', 'updatedBy'])),
        ], 200);
    }

    public function update(GoalProgressRequest $request, GoalProgressUpdate $goalProgressUpdate): JsonResponse
    {
        $dto = GoalProgressDTO::fromRequest($request);
        $updatedGoalProgressUpdate = $this->goalProgressUpdateService->update($goalProgressUpdate, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal progress update updated successfully.',
            'data' => new GoalProgressUpdateResource($updatedGoalProgressUpdate),
        ], 200);
    }

    public function destroy(GoalProgressUpdate $goalProgressUpdate): JsonResponse
    {
        $this->goalProgressUpdateService->delete($goalProgressUpdate);

        return response()->json([
            'status' => 'success',
            'message' => 'Goal progress update deleted successfully.',
        ], 200);
    }
}

