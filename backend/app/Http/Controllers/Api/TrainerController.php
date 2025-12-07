<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TrainerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\DataTransferObjects\TrainerDTO;
use App\Http\Resources\TrainerResource;
use App\Http\Requests\TrainerRequest;
use App\Models\Trainer;

class TrainerController extends Controller
{
    /**
     * TrainerController constructor.
     *
     * @param TrainerService $service
     */
    public function __construct(
        protected TrainerService $service
    ) {}

    /**
     * Get paginated list of trainers.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 10);
        $trainers = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => TrainerResource::collection($trainers),
        ], 200);
    }

    /**
     * Create a new trainer.
     *
     * @param TrainerRequest $request
     * @return JsonResponse
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
     *
     * @param Trainer $trainer
     * @return JsonResponse
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
     *
     * @param TrainerRequest $request
     * @param Trainer $trainer
     * @return JsonResponse
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
     *
     * @param Trainer $trainer
     * @return JsonResponse
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
