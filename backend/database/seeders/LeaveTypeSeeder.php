<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Annual Leave',
                'description' => 'Annual Leave',
                'max_days_per_year' => 21,
                'is_paid' => true,
                'requires_proof' => false,
            ],
            [
                'name' => 'Casual Leave',
                'description' => 'Maximum only 2 Days in request',
                'max_days_per_year' => 6,
                'is_paid' => true,
                'requires_proof' => false,
            ],
            [
                'name' => 'Sick Leave',
                'description' => 'Sick Leave',
                'max_days_per_year' => 180,
                'is_paid' => true,
                'requires_proof' => true,
            ],
            [
                'name' => 'Maternity Leave',
                'description' => 'maximum of twice during the entire service period.',
                'max_days_per_year' => 120,
                'is_paid' => true,
                'requires_proof' => true,
            ],
            [
                'name' => 'Marriage Leave',
                'description' => 'Paid leave for the employee upon marriage.',
                'max_days_per_year' => 7,
                'is_paid' => true,
                'requires_proof' => true, // Marriage certificate required
            ],
            [
                'name' => 'Pilgrimage Leave',
                'description' => 'Paid leave for making a pilgrimage.',
                'max_days_per_year' => 30,
                'is_paid' => true,
                'requires_proof' => true,
            ],
            [
                'name' => 'military Leave',
                'description' => 'For military conscription.',
                'max_days_per_year' => 30,
                'is_paid' => true,
                'requires_proof' => true,
            ],
            [
                'name' => 'Unpaid Leave',
                'description' => 'Leave for special reasons or childcare, for which no pay is given.',
                'max_days_per_year' => 0,
                'is_paid' => false,
                'requires_proof' => false,
            ],
        ];

        foreach ($types as $type) {
            LeaveType::create($type);
        }
    }
}
