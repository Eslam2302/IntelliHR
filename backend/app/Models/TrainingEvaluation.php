<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrainingEvaluation extends Model
{
    protected $fillable = [
        'employee_id',
        'training_id',
        'rating',
        'feedback',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function training()
    {
        return $this->belongsTo(TrainingSession::class, 'training_id');
    }
}
