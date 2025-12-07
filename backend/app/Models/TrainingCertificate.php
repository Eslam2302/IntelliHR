<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingCertificate extends Model
{
    protected $fillable = [
        'employee_training_id',
        'issued_at',
        'certificate_path',
    ];

    public function employeeTraining()
    {
        return $this->belongsTo(EmployeeTraining::class);
    }
}