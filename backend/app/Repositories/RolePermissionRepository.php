<?php

namespace App\Repositories;

use App\Repositories\Contracts\RolePermissionRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

class RolePermissionRepository implements RolePermissionRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Role $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->with('permissions');

        $query = $this->applyFilters(
            $query,
            $filters,
            ['permission_id', 'role_id', 'permissions.name'],
            ['id', 'permission_id', 'role_id', 'created_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

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
