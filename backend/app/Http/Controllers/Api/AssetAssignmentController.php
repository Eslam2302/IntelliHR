<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AssetAssignmentDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssetAssignmentRequest;
use App\Http\Resources\AssetAssignmentResource;
use App\Models\AssetAssignment;
use App\Services\AssetAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AssetAssignmentController extends Controller implements HasMiddleware
{
    /**
     * AssetAssignmentController constructor.
     */
    public function __construct(
        protected AssetAssignmentService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-asset-assignments', only: ['index']),
            new Middleware('permission:view-asset-assignment', only: ['show']),
            new Middleware('permission:create-asset-assignment', only: ['store']),
            new Middleware('permission:edit-asset-assignment', only: ['update']),
            new Middleware('permission:delete-asset-assignment', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of asset assignments.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $assignments = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => AssetAssignmentResource::collection($assignments),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
                'last_page' => $assignments->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new asset assignment.
     */
    public function store(AssetAssignmentRequest $request): JsonResponse
    {
        $dto = AssetAssignmentDTO::fromRequest($request);
        $assignment = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset Assignment created successfully',
            'data' => new AssetAssignmentResource($assignment),
        ], 201);
    }

    /**
     * Display a specific asset assignment.
     */
    public function show(AssetAssignment $asset_assignment): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new AssetAssignmentResource($asset_assignment),
        ], 200);
    }

    /**
     * Update a specific asset assignment.
     */
    public function update(AssetAssignmentRequest $request, AssetAssignment $asset_assignment): JsonResponse
    {
        $dto = AssetAssignmentDTO::fromRequest($request);
        $updatedAssignment = $this->service->update($asset_assignment, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset Assignment updated successfully',
            'data' => new AssetAssignmentResource($updatedAssignment),
        ], 200);
    }

    /**
     * Delete a specific asset assignment.
     */
    public function destroy(AssetAssignment $asset_assignment): JsonResponse
    {
        $this->service->delete($asset_assignment);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset Assignment deleted successfully',
        ], 200);
    }
}
