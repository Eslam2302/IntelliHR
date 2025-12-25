<?php

namespace App\Repositories;

use App\Models\Asset;
use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetRepository implements AssetRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Asset $model
    ) {}

    /**
     * Get paginated list of assets.
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('currentAssignment');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['name', 'serial_number', 'currentAssignment.employee.first_name', 'currentAssignment.employee.last_name', 'currentAssignment.employee.personal_email', 'currentAssignment.employee.phone'],
            ['id', 'name', 'serial_number', 'created_at', 'updated_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 15));
    }

    /**
     * Get an asset by ID.
     */
    public function show(int $assetId): Asset
    {
        return $this->model->findOrFail($assetId);
    }

    /**
     * Create a new asset.
     */
    public function create(array $data): Asset
    {
        return $this->model->create($data)
            ->load('currentAssignment');
    }

    /**
     * Update an existing asset.
     */
    public function update(Asset $asset, array $data): Asset
    {
        $asset->update($data);

        return $asset->fresh();
    }

    /**
     * Delete an asset.
     */
    public function delete(Asset $asset): bool
    {
        return $asset->delete();
    }
}
