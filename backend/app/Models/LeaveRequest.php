<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'days',
        'reason',
        'attachment',
        'status',
        'manager_id',
        'manager_approved_at',
        'hr_id',
        'hr_approved_at'
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
    public function type()
    {
        return $this->belongsTo(LeaveType::class, 'leave_type_id');
    }

    // Manager who approved
    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    // HR who approved
    public function hr()
    {
        return $this->belongsTo(Employee::class, 'hr_id');
    }
}