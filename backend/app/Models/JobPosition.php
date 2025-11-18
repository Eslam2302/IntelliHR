<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPosition extends Model
{
    protected $fillable = [
        'title',
        'grade',
        'min_salary',
        'max_salary',
        'responsibilities'
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class, 'job_id');
    }
}
