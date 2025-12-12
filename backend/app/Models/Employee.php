<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Department;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Employee extends Model
{
    use HasFactory, HasRoles;
    protected $guard_name = 'web';

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

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class, 'employee_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function benefits()
    {
        return $this->hasMany(Benefit::class);
    }

    public function payrolls()
    {
        return $this->hasMany(Payroll::class);
    }

    public function allowances()
    {
        return $this->hasMany(Allowance::class);
    }

    public function deductions()
    {
        return $this->hasMany(Deduction::class);
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class, 'interviewer_id');
    }

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function assets()
    {
        return $this->hasManyThrough(Asset::class, AssetAssignment::class, 'employee_id', 'id', 'id', 'asset_id');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class, 'employee_id');
    }
}
