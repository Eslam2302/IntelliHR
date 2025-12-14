<?php

namespace Database\Seeders;

use App\Models\JobPosition;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use PHPUnit\Util\PHP\Job;

class JobPositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        JobPosition::create([
            'title' => 'HR Manager',
            'grade' => '12',
            'department_id' => '1',
            'min_salary' => 50000,
            'max_salary' => 80000,
            'responsibilities' => 'Responsible for Human resource.',
        ]);
        JobPosition::create([
            'title' => 'Software Engineer',
            'grade' => '10',
            'department_id' => '2',
            'min_salary' => 20000,
            'max_salary' => 80000,
            'responsibilities' => 'Responsible for developing and maintaining software applications.',
        ]);
    }
}