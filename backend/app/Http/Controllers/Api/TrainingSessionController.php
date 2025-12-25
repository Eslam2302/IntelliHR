<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\TrainingSessionDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrainingSessionRequest;
use App\Http\Resources\TrainingSessionResource;
use App\Models\TrainingSession;
use App\Services\TrainingSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TrainingSessionController extends Controller implements HasMiddleware
{
    public function __construct(
        protected TrainingSessionService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-training-sessions', only: ['index']),
            new Middleware('permission:view-training-session', only: ['show']),
            new Middleware('permission:create-training-session', only: ['store']),
            new Middleware('permission:edit-training-session', only: ['update']),
            new Middleware('permission:delete-training-session', only: ['destroy']),
        ];
    }

    /**
     * Display a paginated list of training sessions.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);

        $sessions = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => TrainingSessionResource::collection($sessions),
            'meta' => [
                'current_page' => $sessions->currentPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
                'last_page' => $sessions->lastPage(),
            ],
        ], 200);
    }

    /**
     * Store a newly created training session.
     */
    public function store(TrainingSessionRequest $request): JsonResponse
    {
        $dto = TrainingSessionDTO::fromRequest($request);

        $session = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Session created successfully',
            'data' => new TrainingSessionResource($session),
        ], 201);
    }

    /**
     * Display the specified training session.
     */
    public function show(TrainingSession $trainingSession): JsonResponse
    {
        $trainingSession->load(['trainer.employee', 'department']);

        return response()->json([
            'status' => 'success',
            'data' => new TrainingSessionResource($trainingSession),
        ], 200);
    }

    /**
     * Update the specified training session.
     */
    public function update(TrainingSessionRequest $request, TrainingSession $trainingSession): JsonResponse
    {
        $dto = TrainingSessionDTO::fromRequest($request);

        $updatedSession = $this->service->update($trainingSession, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Session updated successfully',
            'data' => new TrainingSessionResource($updatedSession),
        ], 200);
    }

    /**
     * Remove the specified training session.
     */
    public function destroy(TrainingSession $trainingSession): JsonResponse
    {
        $this->service->delete($trainingSession);

        return response()->json([
            'status' => 'success',
            'message' => 'Training Session deleted successfully',
        ], 200);
    }
}
