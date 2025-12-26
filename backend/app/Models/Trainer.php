<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trainer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'type',
        'employee_id',
        'name',
        'email',
        'phone',
        'company',
    ];

    // Internal Trainer → Employee
    public function employee()
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    // The Trainer has training sessions
    public function trainingSessions()
    {
        return $this->hasMany(TrainingSession::class);
    }
}
