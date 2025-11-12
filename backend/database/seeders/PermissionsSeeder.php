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
            'view-department',
            'view-all-departments',
            'create-department',
            'edit-department',
            'delete-department',

            // (Employees)
            'view-employee',
            'view-all-employees',
            'create-employee',
            'edit-employee',
            'delete-employee',

            // (Leave Type)
            'create-leave-type',
            'edit-leave-type',
            'delete-leave-type',

            // Mangage Roles in UI (Work in the future)
            'assign-roles',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }


        // Create (Super Admin) Role
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdminRole->syncPermissions(Permission::all());

        // Employee Role
        $employeeRole = Role::firstOrCreate(['name' => 'Employee', 'guard_name' => 'web']);
        $employeeRole->syncPermissions([
            Permission::findByName('view-employee', 'web'),
            Permission::findByName('view-department', 'web'),
        ]);


        $firstUser = \App\Models\User::first();
        if ($firstUser) {
            $firstUser->syncRoles('Super Admin');
        }
    }
}
