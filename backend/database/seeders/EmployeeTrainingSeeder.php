<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\EmployeeTraining;

class EmployeeTrainingSeeder extends Seeder
{
    public function run()
    {
        EmployeeTraining::create([
            'employee_id' => 1,
            'training_id' => 1,
            'status' => 'completed',
            'completion_date' => '2025-01-05'
        ]);

        EmployeeTraining::create([
            'employee_id' => 2,
            'training_id' => 1,
            'status' => 'enrolled'
        ]);
    }
}