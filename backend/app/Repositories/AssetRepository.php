<?php

namespace App\Repositories;

use App\Models\Asset;
use App\Repositories\Contracts\AssetRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetRepository implements AssetRepositoryInterface
{
    public function __construct(
        protected Asset $model
    ) {}

    /**
     * Get paginated list of assets.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 15): LengthAwarePaginator
    {
        return $this->model
            ->with('currentAssignment')
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get an asset by ID.
     *
     * @param int $assetId
     * @return Asset
     */
    public function show(int $assetId): Asset
    {
        return $this->model->findOrFail($assetId);
    }

    /**
     * Create a new asset.
     *
     * @param array $data
     * @return Asset
     */
    public function create(array $data): Asset
    {
        return $this->model->create($data)
            ->load('currentAssignment');
    }

    /**
     * Update an existing asset.
     *
     * @param Asset $asset
     * @param array $data
     * @return Asset
     */
    public function update(Asset $asset, array $data): Asset
    {
        $asset->update($data);
        return $asset->fresh();
    }

    /**
     * Delete an asset.
     *
     * @param Asset $asset
     * @return bool
     */
    public function delete(Asset $asset): bool
    {
        return $asset->delete();
    }
}
