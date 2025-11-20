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
                'code' => 'AL',
                'annual_entitlement' => 14,
                'accrual_policy' => 'annual',
                'carry_over_limit' => 14, // handled in service for "carry all remaining"
                'min_request_days' => 1,
                'max_request_days' => 7,
                'requires_hr_approval' => false,
                'payment_type' => 'paid',
                'requires_proof' => false,
                'is_active' => true,
            ],
            [
                'name' => 'Sick Leave',
                'code' => 'SL',
                'annual_entitlement' => 30,
                'accrual_policy' => 'monthly',
                'carry_over_limit' => 0, // no carryover
                'min_request_days' => 1,
                'max_request_days' => 14,
                'requires_hr_approval' => true,
                'payment_type' => 'paid',
                'requires_proof' => true,
                'is_active' => true,
            ],
            [
                'name' => 'Casual Leave',
                'code' => 'CL',
                'annual_entitlement' => 7,
                'accrual_policy' => 'none',
                'carry_over_limit' => 7, // limited carryover
                'min_request_days' => 1,
                'max_request_days' => 2,
                'requires_hr_approval' => false,
                'payment_type' => 'paid',
                'requires_proof' => false,
                'is_active' => true,
            ],
        ];

        foreach ($types as $type) {
            LeaveType::create($type);
        }
    }
}