<?php

namespace App\Repositories;

use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RoleRepository implements RoleRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Role $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('permissions')->withCount('permissions');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['name', 'description', 'permissions.name'],
            ['id', 'name', 'description', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    /**
     * Get a role by ID.
     */
    public function show(int $roleId): Role
    {
        return $this->model
            ->with('permissions')
            ->withCount('permissions')
            ->findOrFail($roleId);
    }

    /**
     * Create a new role.
     */
    public function create(array $data): Role
    {
        $data['guard_name'] = 'web';

        return $this->model->create($data);
    }

    /**
     * Update an existing role.
     */
    public function update(Role $role, array $data): Role
    {
        $data['guard_name'] = 'web';
        $role->update($data);

        return $role->fresh(['permissions']);
    }

    /**
     * Sync permissions to a role.
     */
    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);

        return $role->fresh(['permissions']);
    }

    /**
     * Delete a role.
     */
    public function delete(Role $role): bool
    {
        return $role->delete();
    }
}
