<?php

namespace App\Repositories\Contracts;

use Spatie\Permission\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;

interface RoleRepositoryInterface
{
    /**
     * Retrieve a paginated list of roles.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Retrieve a role by its ID.
     *
     * @param int $roleId
     * @return Role
     */
    public function show(int $roleId): Role;

    /**
     * Create a new role.
     *
     * @param array $data
     * @return Role
     */
    public function create(array $data): Role;

    /**
     * Update the specified role.
     *
     * @param Role $role
     * @param array $data
     * @return Role
     */
    public function update(Role $role, array $data): Role;

    /**
     * Sync permissions to the given role.
     *
     * @param Role $role
     * @param array $permissions
     * @return Role
     */
    public function syncPermissions(Role $role, array $permissions): Role;

    /**
     * Delete the specified role.
     *
     * @param Role $role
     * @return bool
     */
    public function delete(Role $role): bool;
}