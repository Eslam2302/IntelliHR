<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AssetDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssetRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Services\AssetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AssetController extends Controller implements HasMiddleware
{
    /**
     * AssetController constructor.
     */
    public function __construct(
        protected AssetService $service
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-assets', only: ['index']),
            new Middleware('permission:view-asset', only: ['show']),
            new Middleware('permission:create-asset', only: ['store']),
            new Middleware('permission:edit-asset', only: ['update']),
            new Middleware('permission:delete-asset', only: ['destroy']),
        ];
    }

    /**
     * Get paginated list of assets.
     */
    public function index(): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'deleted']);
        $assets = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => AssetResource::collection($assets),
            'meta' => [
                'current_page' => $assets->currentPage(),
                'per_page' => $assets->perPage(),
                'total' => $assets->total(),
                'last_page' => $assets->lastPage(),
            ],
        ], 200);
    }

    /**
     * Create a new asset.
     */
    public function store(AssetRequest $request): JsonResponse
    {
        $dto = AssetDTO::fromRequest($request);
        $asset = $this->service->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset created successfully',
            'data' => new AssetResource($asset),
        ], 201);
    }

    /**
     * Display a specific asset.
     */
    public function show(Asset $asset): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new AssetResource($asset),
        ], 200);
    }

    /**
     * Update a specific asset.
     */
    public function update(AssetRequest $request, Asset $asset): JsonResponse
    {
        $dto = AssetDTO::fromRequest($request);
        $updatedAsset = $this->service->update($asset, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset updated successfully',
            'data' => new AssetResource($updatedAsset),
        ], 200);
    }

    /**
     * Delete a specific asset.
     */
    public function destroy(Asset $asset): JsonResponse
    {
        $this->service->delete($asset);

        return response()->json([
            'status' => 'success',
            'message' => 'Asset deleted successfully',
        ], 200);
    }
}
