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

        $adminUser = User::create([
            'employee_id' => '0001',
            'email' => 'admin@intelli.hr',
            'password' => Hash::make('password'),
            'role' => 'Admin',
        ]);

        Employee::create([
            'user_id' => $adminUser->id,
            'department_id' => $hrDepartment->id,
            'name' => 'Eslam Elsaid',
            'personal_email' => 'eslam.admin@intelli.hr',
            'job_title' => 'System Administrator',
            'hire_date' => now()->subYear(),
        ]);
    }
}
