<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingSession extends Model
{
    protected $fillable = [
        'title',
        'start_date',
        'end_date',
        'trainer_id',
        'department_id',
        'description',
    ];

    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // Employees who registered for training
    public function employeeTraining()
    {
        return $this->hasMany(EmployeeTraining::class, 'training_id');
    }

    // Employees directly
    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'employee_training', 'training_id', 'employee_id');
    }

    public function evaluations()
    {
        return $this->hasMany(TrainingEvaluation::class, 'training_id');
    }
}
