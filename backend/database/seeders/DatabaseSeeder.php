<?php

namespace Database\Seeders;

use App\Models\AssetAssignment;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            DepartmentSeeder::class,
            PermissionsSeeder::class,
            AdminUserSeeder::class,
            ContractSeeder::class,
            LeaveTypeSeeder::class,
            LeaveBalanceSeeder::class,
            JobPositionSeeder::class,
            TrainerSeeder::class,
            TrainingSessionSeeder::class,
            EmployeeTrainingSeeder::class,
            TrainingEvaluationSeeder::class,
            TrainingCertificateSeeder::class,
            AssetsSeeder::class,
            AssetAssignmentsSeeder::class,
            ExpenseCategorySeeder::class,
            ExpenseSeeder::class,
        ]);
    }
}
