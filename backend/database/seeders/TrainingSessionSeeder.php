<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingSession;

class TrainingSessionSeeder extends Seeder
{
    public function run()
    {
        TrainingSession::create([
            'title' => 'Leadership Skills',
            'start_date' => '2025-01-01',
            'end_date' => '2025-01-05',
            'trainer_id' => 1,
            'department_id' => 1,
            'description' => 'Leadership and team management training.'
        ]);

        TrainingSession::create([
            'title' => 'Advanced Excel',
            'start_date' => '2025-02-10',
            'end_date' => '2025-02-12',
            'trainer_id' => 2,
            'department_id' => 2,
            'description' => 'Excel formulas, pivot tables, reports.'
        ]);
    }
}
