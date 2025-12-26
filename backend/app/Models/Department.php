<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
    ];

    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    public function jobPosts()
    {
        return $this->hasMany(JobPost::class, 'department_id');
    }

    public function jobPositions()
    {
        return $this->hasMany(JobPosition::class);
    }
}
