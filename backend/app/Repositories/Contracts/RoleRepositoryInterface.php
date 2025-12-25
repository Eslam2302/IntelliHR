<?php

namespace App\Repositories\Contracts;

use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Role;

interface RoleRepositoryInterface
{
    /**
     * Retrieve a paginated list of roles.
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Retrieve a role by its ID.
     */
    public function show(int $roleId): Role;

    /**
     * Create a new role.
     */
    public function create(array $data): Role;

    /**
     * Update the specified role.
     */
    public function update(Role $role, array $data): Role;

    /**
     * Sync permissions to the given role.
     */
    public function syncPermissions(Role $role, array $permissions): Role;

    /**
     * Delete the specified role.
     */
    public function delete(Role $role): bool;
}
