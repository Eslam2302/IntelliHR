<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TrainingSessionService;
use App\Http\Requests\TrainingSessionRequest;
use App\Http\Resources\TrainingSessionResource;
use App\DataTransferObjects\TrainingSessionDTO;
use App\Models\TrainingSession;
use Illuminate\Http\JsonResponse;

class TrainingSessionController extends Controller
{
    public function __construct(
        protected TrainingSessionService $service
    ) {}

    /**
     * Display a paginated list of training sessions.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perPage = request('per_page', 10);

        $sessions = $this->service->getAllPaginated($perPage);

        return response()->json([
            'status' => 'success',
            'data' => TrainingSessionResource::collection($sessions),
        ], 200);
    }

    /**
     * Store a newly created training session.
     *
     * @param TrainingSessionRequest $request
     * @return JsonResponse
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
     *
     * @param TrainingSession $trainingSession
     * @return JsonResponse
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
     *
     * @param TrainingSessionRequest $request
     * @param TrainingSession $trainingSession
     * @return JsonResponse
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
     *
     * @param TrainingSession $trainingSession
     * @return JsonResponse
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
