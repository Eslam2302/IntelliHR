<?php

namespace App\Repositories;

use App\Repositories\Contracts\RolePermissionRepositoryInterface;
use Spatie\Permission\Models\Role;

class RolePermissionRepository implements RolePermissionRepositoryInterface
{
    /**
     * Sync permissions with role.
     */
    public function sync(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);
        return $role->load('permissions');
    }

    /**
     * Get permissions of role.
     */
    public function getRolePermissions(Role $role): array
    {
        return $role->permissions->pluck('name')->toArray();
    }
}