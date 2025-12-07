<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trainer;

class TrainerSeeder extends Seeder
{
    public function run()
    {
        Trainer::create([
            'type' => 'external',
            'name' => 'Ahmed Ali',
            'email' => 'ahmed@example.com',
            'phone' => '01111111111',
            'company' => 'Pro Academy'
        ]);

        Trainer::create([
            'type' => 'external',
            'name' => 'Sara Hamdy',
            'email' => 'sara@example.com',
            'phone' => '02222222222',
            'company' => 'SkillUp'
        ]);
    }
}
