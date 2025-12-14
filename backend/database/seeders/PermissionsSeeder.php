<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Employee;

class PermissionsSeeder extends Seeder
{

    public function run(): void
    {
        // Clear Cache
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Basic Permissions
        $permissions = [

            // Department
            'view-all-departments',
            'view-department',
            'create-department',
            'edit-department',
            'delete-department',

            // Employee
            'view-all-employees',
            'view-employee',
            'create-employee',
            'edit-employee',
            'delete-employee',

            // Contract
            'view-all-contracts',
            'view-contract',
            'create-contract',
            'edit-contract',
            'delete-contract',

            // Document
            'view-all-documents',
            'view-document',
            'create-document',
            'edit-document',
            'delete-document',

            // Job Position
            'view-all-job-positions',
            'view-job-position',
            'create-job-position',
            'edit-job-position',
            'delete-job-position',

            // ---------------------
            // Leaves
            // ---------------------

            // Leave Request
            'manager-approve-leave-request',
            'hr-approve-leave-request',
            'view-employees-leave-request',

            // Leave Types
            'view-all-leave-types',
            'view-leave-type',
            'create-leave-type',
            'edit-leave-type',
            'delete-leave-type',




            // ---------------------
            // Payroll & Payment
            // ---------------------

            // Allowance
            'view-all-allowances',
            'view-allowance',
            'create-allowance',
            'edit-allowance',
            'delete-allowance',

            // Benefit
            'view-all-benefits',
            'view-benefit',
            'create-benefit',
            'edit-benefit',
            'delete-benefit',

            // Deduction
            'view-all-deductions',
            'view-deduction',
            'create-deduction',
            'edit-deduction',
            'delete-deduction',

            // payroll
            'view-all-payrolls',
            'view-payroll',
            'create-payroll',
            'edit-payroll',
            'delete-payroll',

            // Payroll Payment
            'create-payroll-payment',

            // ---------------------
            // Training
            // ---------------------

            // Trainer
            'view-all-trainers',
            'view-trainer',
            'create-trainer',
            'edit-trainer',
            'delete-trainer',

            // Training Certificate
            'view-all-training-certificates',
            'view-training-certificate',
            'create-training-certificate',
            'edit-training-certificate',
            'delete-training-certificate',

            // Training Evaluation
            'view-all-training-evaluations',
            'view-training-evaluation',
            'create-training-evaluation',
            'edit-training-evaluation',
            'delete-training-evaluation',

            // Training Session
            'view-all-training-sessions',
            'view-training-session',
            'create-training-session',
            'edit-training-session',
            'delete-training-session',

            // Employee Training
            'view-all-employee-trainings',
            'view-employee-training',
            'create-employee-training',
            'edit-employee-training',
            'delete-employee-training',

            // ---------------------
            // Recruitment
            // ---------------------

            // Job Post
            'view-all-job-posts',
            'view-job-post',
            'create-job-post',
            'edit-job-post',
            'delete-job-post',

            // Hiring Stage
            'view-all-hiring-stages',
            'view-hiring-stage',
            'create-hiring-stage',
            'edit-hiring-stage',
            'delete-hiring-stage',

            // Applicant
            'view-all-applicants',
            'view-applicant',
            'create-applicant',
            'edit-applicant',
            'delete-applicant',

            // Interview
            'view-all-interviews',
            'view-interview',
            'create-interview',
            'edit-interview',
            'delete-interview',

            // ---------------------
            // Assets
            // ---------------------

            // Asset
            'view-all-assets',
            'view-asset',
            'create-asset',
            'edit-asset',
            'delete-asset',

            // Asset Assignment
            'view-all-asset-assignments',
            'view-asset-assignment',
            'create-asset-assignment',
            'edit-asset-assignment',
            'delete-asset-assignment',

            // ---------------------
            // Expenses
            // ---------------------

            // Expense Category
            'view-all-expense-categories',
            'view-expense-category',
            'create-expense-category',
            'edit-expense-category',
            'delete-expense-category',

            // Expense
            'view-all-expenses',
            'view-expense',
            'create-expense',
            'edit-expense',
            'delete-expense',

            // Attendance
            'view-all-attendances',

            // Mangage Roles & in UI (Work in the future)
            'roles-manage',
            'assign-roles',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }


        // Create (Super Admin) Role
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdminRole->syncPermissions(Permission::all());

        // Assign Super Admin to first Employee
        $firstEmployee = Employee::first();
        if ($firstEmployee) {
            $firstEmployee->syncRoles('Super Admin');
        }
    }
}
