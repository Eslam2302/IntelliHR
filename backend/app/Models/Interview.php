<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $fillable = [
        'applicant_id',
        'interviewer_id',
        'scheduled_at',
        'score',
        'notes',
        'status'
    ];

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    public function interviewer()
    {
        return $this->belongsTo(Employee::class, 'interviewer_id');
    }
}
