<?php

namespace App\Repositories\Contracts;

use App\Models\Asset;
use Illuminate\Pagination\LengthAwarePaginator;

interface AssetRepositoryInterface
{
    /**
     * Retrieve a paginated list of assets.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve an asset by its ID.
     *
     * @param int $assetId
     * @return Asset
     */
    public function show(int $assetId): Asset;

    /**
     * Create a new asset record.
     *
     * @param array $data
     * @return Asset
     */
    public function create(array $data): Asset;

    /**
     * Update the specified asset.
     *
     * @param Asset $asset
     * @param array $data
     * @return Asset
     */
    public function update(Asset $asset, array $data): Asset;

    /**
     * Delete the specified asset.
     *
     * @param Asset $asset
     * @return bool
     */
    public function delete(Asset $asset): bool;
}