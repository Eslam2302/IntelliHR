<?php

namespace App\Services;

use App\DataTransferObjects\AssetDTO;
use App\Models\Asset;
use App\Repositories\Contracts\AssetRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class AssetService
{
    public function __construct(
        protected AssetRepositoryInterface $repository
    ) {}

    /**
     * Retrieve paginated list of assets.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     * @throws \Exception
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching Assets: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve an asset by ID.
     *
     * @param int $assetId
     * @return Asset
     * @throws \Exception
     */
    public function show(int $assetId): Asset
    {
        try {
            return $this->repository->show($assetId);
        } catch (\Exception $e) {
            Log::error("Error fetching Asset ID {$assetId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new asset using the provided DTO.
     *
     * @param AssetDTO $dto
     * @return Asset
     * @throws \Exception
     */
    public function create(AssetDTO $dto): Asset
    {
        try {
            $asset = $this->repository->create($dto->toArray());

            Log::info("Asset created successfully", [
                'id' => $asset->id,
                'name' => $asset->name,
                'serial_number' => $asset->serial_number,
            ]);

            return $asset;
        } catch (\Exception $e) {
            Log::error('Error creating Asset: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given asset using the provided DTO.
     *
     * @param Asset $asset
     * @param AssetDTO $dto
     * @return Asset
     * @throws \Exception
     */
    public function update(Asset $asset, AssetDTO $dto): Asset
    {
        try {
            $updatedAsset = $this->repository->update($asset, $dto->toArray());

            Log::info("Asset updated successfully", [
                'id' => $updatedAsset->id,
                'name' => $updatedAsset->name,
                'serial_number' => $updatedAsset->serial_number,
            ]);

            return $updatedAsset;
        } catch (\Exception $e) {
            Log::error("Error updating Asset ID {$asset->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given asset instance.
     *
     * @param Asset $asset
     * @return bool
     * @throws \Exception
     */
    public function delete(Asset $asset): bool
    {
        try {
            $deleted = $this->repository->delete($asset);

            Log::info("Asset deleted successfully", [
                'id' => $asset->id,
                'name' => $asset->name,
                'serial_number' => $asset->serial_number,
            ]);

            return $deleted;
        } catch (\Exception $e) {
            Log::error("Error deleting Asset ID {$asset->id}: " . $e->getMessage());
            throw $e;
        }
    }
}