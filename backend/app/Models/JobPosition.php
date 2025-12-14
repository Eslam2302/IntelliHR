<?php

namespace App\Models;

use App\Models\Department;
use Illuminate\Database\Eloquent\Model;

class JobPosition extends Model
{
    protected $fillable = [
        'title',
        'grade',
        'min_salary',
        'max_salary',
        'responsibilities',
        'department_id'
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'job_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
