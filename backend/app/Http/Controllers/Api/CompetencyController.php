<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\CompetencyDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\CompetencyRequest;
use App\Http\Resources\CompetencyResource;
use App\Models\Competency;
use App\Services\CompetencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class CompetencyController extends Controller implements HasMiddleware
{
    public function __construct(protected CompetencyService $competencyService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-competencies', only: ['index']),
            new Middleware('permission:view-competency', only: ['show']),
            new Middleware('permission:create-competency', only: ['store']),
            new Middleware('permission:edit-competency', only: ['update']),
            new Middleware('permission:delete-competency', only: ['destroy']),
        ];
    }

    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $competencies = $this->competencyService->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => CompetencyResource::collection($competencies),
            'meta' => [
                'current_page' => $competencies->currentPage(),
                'per_page' => $competencies->perPage(),
                'total' => $competencies->total(),
                'last_page' => $competencies->lastPage(),
            ],
        ]);
    }

    public function store(CompetencyRequest $request): JsonResponse
    {
        $dto = CompetencyDTO::fromRequest($request);
        $competency = $this->competencyService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Competency created successfully.',
            'data' => new CompetencyResource($competency),
        ], 201);
    }

    public function show(Competency $competency): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new CompetencyResource($competency),
        ], 200);
    }

    public function update(CompetencyRequest $request, Competency $competency): JsonResponse
    {
        $dto = CompetencyDTO::fromRequest($request);
        $updatedCompetency = $this->competencyService->update($competency, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Competency updated successfully.',
            'data' => new CompetencyResource($updatedCompetency),
        ], 200);
    }

    public function destroy(Competency $competency): JsonResponse
    {
        $this->competencyService->delete($competency);

        return response()->json([
            'status' => 'success',
            'message' => 'Competency deleted successfully.',
        ], 200);
    }
}

