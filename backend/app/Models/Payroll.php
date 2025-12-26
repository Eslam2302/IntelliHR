<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payroll extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'employee_id',
        'year',
        'month',
        'basic_salary',
        'allowances',
        'deductions',
        'net_pay',
        'processed_at',
        'payment_status',
        'stripe_charge_id',
        'paid_at',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
        'paid_at' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function allowances()
    {
        return $this->hasMany(Allowance::class);
    }

    public function deductions()
    {
        return $this->hasMany(Deduction::class);
    }
}
