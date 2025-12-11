<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AssetService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\DataTransferObjects\AssetDTO;
use App\Http\Resources\AssetResource;
use App\Http\Requests\AssetRequest;
use App\Models\Asset;

class AssetController extends Controller
{
    /**
     * AssetController constructor.
     *
     * @param AssetService $service
     */
    public function __construct(
        protected AssetService $service
    ) {}

    /**
     * Get paginated list of assets.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $perpage = request('per_page', 20);
        $assets = $this->service->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data' => AssetResource::collection($assets),
        ], 200);
    }

    /**
     * Create a new asset.
     *
     * @param AssetRequest $request
     * @return JsonResponse
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
     *
     * @param Asset $asset
     * @return JsonResponse
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
     *
     * @param AssetRequest $request
     * @param Asset $asset
     * @return JsonResponse
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
     *
     * @param Asset $asset
     * @return JsonResponse
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
