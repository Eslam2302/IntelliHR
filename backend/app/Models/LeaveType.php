<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{

    use HasFactory;
    protected $fillable = [
        'name',
        'code',
        'annual_entitlement',
        'accrual_policy',
        'carry_over_limit',
        'min_request_days',
        'max_request_days',
        'requires_hr_approval',
        'is_active',
        'payment_type',
        'requires_proof'
    ];

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }
}