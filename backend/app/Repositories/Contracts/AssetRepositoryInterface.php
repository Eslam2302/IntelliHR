<?php

namespace App\Repositories\Contracts;

use App\Models\Asset;
use Illuminate\Pagination\LengthAwarePaginator;

interface AssetRepositoryInterface
{
    /**
     * Retrieve a paginated list of assets.
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve an asset by its ID.
     */
    public function show(int $assetId): Asset;

    /**
     * Create a new asset record.
     */
    public function create(array $data): Asset;

    /**
     * Update the specified asset.
     */
    public function update(Asset $asset, array $data): Asset;

    /**
     * Delete the specified asset.
     */
    public function delete(Asset $asset): bool;
}
