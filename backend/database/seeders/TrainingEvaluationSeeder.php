<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\TrainingEvaluation;

class TrainingEvaluationSeeder extends Seeder
{
    public function run()
    {
        TrainingEvaluation::create([
            'employee_id' => 1,
            'training_id' => 1,
            'rating' => 5,
            'feedback' => 'Great training, very useful!'
        ]);
    }
}
