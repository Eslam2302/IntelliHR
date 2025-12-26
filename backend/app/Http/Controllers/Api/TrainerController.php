<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\TrainerDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\TrainerRequest;
use App\Http\Resources\TrainerResource;
use App\Models\Trainer;
use App\Services\TrainerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class TrainerController extends Controller implements HasMiddleware
{
    /**
     * TrainerController constructor.
     */
    public function __construct(
        protected TrainerService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-trainers', only: ['index']),
            new Middleware('permission:view-trainer', only: ['show']),
            new Middleware('permission:create-trainer', only: ['store']),
            new Middleware('permission:edit-trainer', only: ['update']),
            new Middleware('permission:delete-trainer', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of trainers.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $trainers = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => TrainerResource::collection($trainers),
            'meta' => [
                'current_page' => $trainers->currentPage(),
                'per_page' => $trainers->perPage(),
                'total' => $trainers->total(),
                'last_page' => $trainers->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new trainer.
     */
    public function store(TrainerRequest $request): JsonResponse
    {
        $dto = TrainerDTO::fromRequest($request);
        $trainer = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Trainer created successfully',
            'data' => new TrainerResource($trainer),
        ], 201);
    }

    /**
     * Display a specific trainer.
     */
    public function show(Trainer $trainer): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new TrainerResource($trainer),
        ], 200);
    }

    /**
     * Update a specific trainer.
     */
    public function update(TrainerRequest $request, Trainer $trainer): JsonResponse
    {
        $dto = TrainerDTO::fromRequest($request);
        $updatedTrainer = $this->service->update($trainer, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Trainer updated successfully',
            'data' => new TrainerResource($updatedTrainer),
        ], 200);
    }

    /**
     * Delete a specific trainer.
     */
    public function destroy(Trainer $trainer): JsonResponse
    {
        $this->service->delete($trainer);

        return response()->json([
            'status' => 'success',
            'message' => 'Trainer deleted successfully',
        ], 200);
    }
}
