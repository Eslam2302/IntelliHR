<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosition extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'grade',
        'min_salary',
        'max_salary',
        'responsibilities',
        'department_id',
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
