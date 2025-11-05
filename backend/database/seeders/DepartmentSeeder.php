<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Department::create([
            'name' => 'Human Resources',
            'description' => 'Handles recruitment, employee relations, and benefits management.',
        ]);

        Department::create([
            'name'  => 'Information Technology',
            'description' => 'Responsible for managing the company\'s technology infrastructure and support.',
        ]);
    }
}
