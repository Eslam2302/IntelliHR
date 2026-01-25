<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
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
            'work_email' => 'super-admin@intlihr.com',
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
            'personal_email' => 'admin@hr.com',
            'password' => Hash::make('password'),
        ]);

        $testEmployee = Employee::create([
            'first_name' => 'test',
            'last_name' => 'Employee',
            'work_email' => 'test@intlihr.com',
            'phone' => '1213123123',
            'gender' => 'Male',
            'national_id' => '123123123123',
            'employee_status' => 'Active',
            'department_id' => $hrDepartment->id,
            'hire_date' => now()->subYears(5)->format('Y-m-d'),
            'birth_date' => now()->subYears(3)->format('Y-m-d'),

        ]);

        $testUser = User::create([
            'employee_id' => $testEmployee->id,
            'personal_email' => 'test@hr.com',
            'password' => Hash::make('password'),
        ]);

        $adminEmployee->assignRole('Super Admin');
    }
}
