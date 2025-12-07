<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeTraining extends Model
{
    protected $fillable = [
        'employee_id',
        'training_id',
        'status',
        'completion_date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function training()
    {
        return $this->belongsTo(TrainingSession::class, 'training_id');
    }

    public function certificate()
    {
        return $this->hasOne(TrainingCertificate::class, 'employee_training_id');
    }
}
