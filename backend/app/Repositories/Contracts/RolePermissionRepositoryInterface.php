<?php

namespace App\Repositories\Contracts;

use Spatie\Permission\Models\Role;

interface RolePermissionRepositoryInterface
{
    /**
     * Sync permissions with the given role.
     *
     * @param Role $role
     * @param array $permissions
     * @return Role
     */
    public function sync(Role $role, array $permissions): Role;

    /**
     * Get permissions assigned to the role.
     *
     * @param Role $role
     * @return array
     */
    public function getRolePermissions(Role $role): array;
}