<?php

namespace App\Services;

use App\DataTransferObjects\RolePermissionDTO;
use App\Repositories\Contracts\RolePermissionRepositoryInterface;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use Exception;

class RolePermissionService
{
    public function __construct(
        protected RolePermissionRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Sync permissions for role.
     */
    public function sync(Role $role, RolePermissionDTO $dto): Role
    {
        try {
            $oldPermissions = $role->permissions->pluck('id')->toArray();

            $role = $this->repository->sync($role, $dto->permissions);

            $this->activityLogger->log(
                logName: 'rolePermission',
                description: 'role_permissions_synced',
                subject: $role,
                properties: [
                    'role_id' => $role->id,
                    'before_permissions' => $oldPermissions,
                    'after_permissions' => $dto->permissions,
                ]
            );

            Log::info('Permissions synced successfully', [
                'role_id' => $role->id,
                'permissions' => $dto->permissions,
            ]);

            return $role;
        } catch (Exception $e) {
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
