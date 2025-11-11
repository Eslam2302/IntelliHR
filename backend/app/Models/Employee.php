<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Department;

class Employee extends Model
{
    protected $fillable = [
        'name',
        'personal_email',
        'phone',
        'manager_id',
        'job_title',
        'hire_date',
        'department_id',
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
}
