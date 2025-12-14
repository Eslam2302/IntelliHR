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
            'first_name' => 'Admin',
            'last_name' => 'User',
            'personal_email' => 'super-admin@intlihr.com',
            'phone' => '01111111111',
            'gender' => 'Male',
            'national_id' => '3000230162951',
            'employee_status' => 'Active',
            'department_id' => $hrDepartment->id,
            'hire_date' => now()->subYears(5)->format('Y-m-d'),
            'birth_date' => now()->subYears(3)->format('Y-m-d'),

        ]);

        $adminUser = User::create([
            'employee_id' => $adminEmployee->id,
            'email' => 'admin@hr.com',
            'password' => Hash::make('password'),
        ]);

        // Add a test employee
        $testEmployee = Employee::create([
            'first_name' => 'Test',
            'last_name' => 'Employee',
            'personal_email' => 'test-employee@intlihr.com',
            'phone' => '01111111111',
            'gender' => 'Female',
            'national_id' => '3010230162951',
            'manager_id'    => '1',
            'employee_status' => 'active',
            'department_id' => $hrDepartment->id,
            'hire_date' => now()->subYears(1)->format('Y-m-d'),
            'birth_date' => now()->subYears(2)->format('Y-m-d'),

        ]);

        $testUser = User::create([
            'employee_id' => $testEmployee->id,
            'email' => 'test@hr.com',
            'password' => Hash::make('password'),
        ]);

        $adminEmployee->assignRole('Super Admin');
    }
}