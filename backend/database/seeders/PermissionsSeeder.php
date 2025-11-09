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

            // Mangage Roles in UI (Work in the future)
            'assign-roles',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }


        // Create (Super Admin) Role
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdminRole->syncPermissions(Permission::all());

        // Employee Role
        $employeeRole = Role::firstOrCreate(['name' => 'Employee']);
        $employeeRole->syncPermissions([
            'view-employee',
            'view-department',
        ]);


        $firstUser = \App\Models\User::first();
        if ($firstUser) {
            $firstUser->syncRoles('Super Admin');
        }
    }
}