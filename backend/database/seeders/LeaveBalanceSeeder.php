<?php

namespace Database\Seeders;

use App\Models\LeaveBalance;
use GuzzleHttp\Promise\Create;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LeaveBalanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        LeaveBalance::create([
            'employee_id' => 1,
            'leave_type_id' => 1,
             'total_entitlement' => 14,
            'used_days' => 0,
            'remaining_days' => 14,
            'year' => date('Y'),
        ]);

        LeaveBalance::create([
            'employee_id' => 1,
            'leave_type_id' => 2,
             'total_entitlement' => 30,
            'used_days' => 0,
            'remaining_days' => 30,
            'year' => date('Y'),
        ]);
        LeaveBalance::create([
            'employee_id' => 1,
            'leave_type_id' => 3,
             'total_entitlement' => 7,
            'used_days' => 0,
            'remaining_days' => 7,
            'year' => date('Y'),
        ]);
        LeaveBalance::create([
            'employee_id' => 2,
            'leave_type_id' => 1,
             'total_entitlement' => 14,
            'used_days' => 0,
            'remaining_days' => 14,
            'year' => date('Y'),
        ]);

        LeaveBalance::create([
            'employee_id' => 2,
            'leave_type_id' => 2,
             'total_entitlement' => 30,
            'used_days' => 0,
            'remaining_days' => 30,
            'year' => date('Y'),
        ]);
        LeaveBalance::create([
            'employee_id' => 2,
            'leave_type_id' => 3,
             'total_entitlement' => 7,
            'used_days' => 0,
            'remaining_days' => 7,
            'year' => date('Y'),
        ]);
    }
}
