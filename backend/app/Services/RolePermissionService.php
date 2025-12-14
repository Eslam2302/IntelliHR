<?php

namespace App\Services;

use App\DataTransferObjects\RolePermissionDTO;
use App\Repositories\Contracts\RolePermissionRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;

class RolePermissionService
{
    public function __construct(
        protected RolePermissionRepositoryInterface $repository
    ) {}

    /**
     * Sync permissions for role.
     */
    public function sync(Role $role, RolePermissionDTO $dto): Role
    {
        try {
            $role = $this->repository->sync($role, $dto->permissions);

            Log::info('Permissions synced successfully', [
                'role_id' => $role->id,
                'permissions' => $dto->permissions,
            ]);

            return $role;
        } catch (\Exception $e) {
            Log::error('Error syncing permissions: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get role permissions.
     */
    public function get(Role $role): array
    {
        return $this->repository->getRolePermissions($role);
    }
}