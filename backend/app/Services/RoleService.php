<?php

namespace App\Services;

use App\DataTransferObjects\RoleDTO;
use App\Repositories\Contracts\RoleRepositoryInterface;
use Spatie\Permission\Models\Role;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Exception;

class RoleService
{
    public function __construct(
        protected RoleRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     * Retrieve paginated list of roles.
     *
     * @param int $perpage
     * @return LengthAwarePaginator
     * @throws Exception
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (Exception $e) {
            Log::error('Error fetching roles: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Retrieve a role by ID.
     *
     * @param int $roleId
     * @return Role
     * @throws Exception
     */
    public function show(int $roleId): Role
    {
        try {
            return $this->repository->show($roleId);
        } catch (Exception $e) {
            Log::error("Error fetching role ID {$roleId}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new role using the provided DTO.
     *
     * @param RoleDTO $dto
     * @return Role
     * @throws Exception
     */
    public function create(RoleDTO $dto): Role
    {
        try {
            $role = $this->repository->create($dto->toArray());

            if ($dto->permissions) {
                $this->repository->syncPermissions($role, $dto->permissions);
            }

            $this->activityLogger->log(
                logName: 'role',
                description: 'role_created',
                subject: $role,
                properties: [
                    'name' => $role->name,
                    'permissions' => $dto->permissions ?? [],
                ]
            );

            Log::info('Role created successfully', [
                'role_id' => $role->id,
                'name' => $role->name,
            ]);

            return $role->load('permissions');
        } catch (Exception $e) {
            Log::error('Error creating role: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update the given role using the provided DTO.
     *
     * @param Role $role
     * @param RoleDTO $dto
     * @return Role
     * @throws Exception
     */
    public function update(Role $role, RoleDTO $dto): Role
    {
        try {
            $oldData = [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('id')->toArray(),
            ];

            $updatedRole = $this->repository->update($role, $dto->toArray());

            if (! is_null($dto->permissions)) {
                $this->repository->syncPermissions($updatedRole, $dto->permissions);
            }

            $newData = [
                'name' => $updatedRole->name,
                'permissions' => $dto->permissions ?? $oldData['permissions'],
            ];

            $this->activityLogger->log(
                logName: 'role',
                description: 'role_updated',
                subject: $updatedRole,
                properties: [
                    'before' => $oldData,
                    'after'  => $newData,
                ]
            );

            Log::info('Role updated successfully', [
                'role_id' => $updatedRole->id,
                'name' => $updatedRole->name,
            ]);

            return $updatedRole;
        } catch (Exception $e) {
            Log::error("Error updating role ID {$role->id}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Delete the given role.
     *
     * @param Role $role
     * @return bool
     * @throws Exception
     */
    public function delete(Role $role): bool
    {
        try {
            $data = [
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('id')->toArray(),
            ];

            $deleted = $this->repository->delete($role);

            $this->activityLogger->log(
                logName: 'role',
                description: 'role_deleted',
                subject: $role,
                properties: $data
            );

            Log::info('Role deleted successfully', [
                'role_id' => $role->id,
                'name' => $role->name,
            ]);

            return $deleted;
        } catch (Exception $e) {
            Log::error("Error deleting role ID {$role->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
