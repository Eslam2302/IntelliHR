<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Department;

class Employee extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'personal_email',
        'phone',
        'gender',
        'national_id',
        'birth_date',
        'address',
        'employee_status',
        'department_id',
        'manager_id',
        'job_id',
        'hire_date',
    ];

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'employee_id');
    }

    public function job()
    {
        return $this->belongsTo(JobPosition::class, 'job_id');
    }

    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function contract()
    {
        return $this->hasOne(Contract::class);
    }
}