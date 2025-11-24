<?php

namespace Database\Seeders;

use App\Models\Contract;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ContractSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Contract::create([
            'employee_id' => 1,
            'start_date' => now()->subYears(5)->format('Y-m-d'),
            'end_date' => null,
            'contract_type' => 'full_time',
            'probation_period_days' => 90,
            'salary' => 60000,
            'terms' => 'Standard full-time employment contract terms.',
        ]);

        Contract::create([
            'employee_id' => 2,
            'start_date' => now()->subYears(4)->format('Y-m-d'),
            'end_date' => null,
            'contract_type' => 'full_time',
            'probation_period_days' => 90,
            'salary' => 10000,
            'terms' => 'Standard full-time employment contract terms.',
        ]);
    }
}