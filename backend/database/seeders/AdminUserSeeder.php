<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hrDepartment = Department::where('name', 'Human Resources')->first();

        $adminEmployee = Employee::create([
            'name' => 'Admin User',
            'job_title' => 'System Administrator',
            'department_id' => $hrDepartment->id,
            'hire_date' => now()->subYears(5)->format('Y-m-d'),
        ]);

        $adminUser = User::create([
            'employee_id' => $adminEmployee->id,
            'email' => 'admin@hr.com',
            'password' => Hash::make('password'),
        ]);

        // يمكن إضافة موظف عادxي آخر للتجربة
        $testEmployee = Employee::create([
            'name' => 'Test Employee',
            'job_title' => 'Software Developer',
            'department_id' => $hrDepartment->id,
            'hire_date' => now()->subYears(1)->format('Y-m-d'),
        ]);

        $testUser = User::create([
            'employee_id' => $testEmployee->id,
            'email' => 'test@hr.com',
            'password' => Hash::make('password'),
        ]);

        $adminUser->assignRole('Super Admin');
        $testUser->assignRole('Employee');

    }
}
