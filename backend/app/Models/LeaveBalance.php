<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LeaveBalance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'year',
        'total_entitlement',
        'used_days',
        'remaining_days',
    ];

    protected $casts = [
        'year' => 'integer',
        'total_entitlement' => 'float',
        'used_days' => 'float',
        'remaining_days' => 'float',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    /**
     * Each balance belongs to one employee.
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Each balance belongs to one leave type.
     */
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
}