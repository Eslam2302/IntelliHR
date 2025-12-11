<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AssetAssignment;
use App\Models\Asset;
use App\Models\Employee;

class AssetAssignmentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $employees = Employee::all();
        $assets = Asset::all();

        foreach ($assets as $asset) {

            if ($asset->status !== 'retired' && $employees->count() > 0) {
                $employee = $employees->random();

                $assignedDate = fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d');
                $returnDate = $asset->status === 'assigned' ? null : fake()->dateTimeBetween($assignedDate, 'now')->format('Y-m-d');

                AssetAssignment::create([
                    'asset_id' => $asset->id,
                    'employee_id' => $employee->id,
                    'assigned_date' => $assignedDate,
                    'return_date' => $returnDate,
                ]);
            }
        }
    }
}