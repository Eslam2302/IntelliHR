<?php

namespace App\Repositories;

use Spatie\Permission\Models\Role;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class RoleRepository implements RoleRepositoryInterface
{
    public function __construct(
        protected Role $model
    ) {}

    /**
     * Get paginated list of roles.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->with('permissions')
            ->withCount('permissions')
            ->latest()
            ->paginate($perpage);
    }

    /**
     * Get a role by ID.
     *
     * @param int $roleId
     * @return Role
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
     *
     * @param array $data
     * @return Role
     */
    public function create(array $data): Role
    {
        $data['guard_name'] = 'web';
        return $this->model->create($data);
    }

    /**
     * Update an existing role.
     *
     * @param Role $role
     * @param array $data
     * @return Role
     */
    public function update(Role $role, array $data): Role
    {
        $data['guard_name'] = 'web';
        $role->update($data);
        return $role->fresh(['permissions']);
    }

    /**
     * Sync permissions to a role.
     *
     * @param Role $role
     * @param array $permissions
     * @return Role
     */
    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);
        return $role->fresh(['permissions']);
    }

    /**
     * Delete a role.
     *
     * @param Role $role
     * @return bool
     */
    public function delete(Role $role): bool
    {
        return $role->delete();
    }
}