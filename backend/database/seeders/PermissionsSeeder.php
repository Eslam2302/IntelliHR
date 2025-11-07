<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class PermissionsSeeder extends Seeder
{

    public function run(): void
    {
        // Clear Cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Basic Permissions
        $permissions = [
            // (Departments)
            'view-department', 'create-department', 'edit-department', 'delete-department',

            // (Employees)
            'view-employee', 'view-any-employee', 'create-employee', 'edit-employee', 'delete-employee',

            'is-supervisor',

            'manage-salaries',
            'view-audit-logs',
            'assign-roles', // Add or delete role
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }


        // 2. إنشاء الدور الوحيد (Super Admin)
        $adminRole = Role::firstOrCreate(['name' => 'Super Admin']);

        $adminRole->givePermissionTo(Permission::all());


        $firstUser = \App\Models\User::first();
        if ($firstUser) {
            $firstUser->syncRoles('Super Admin');
        }
    }
}
