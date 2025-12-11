<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HiringStage extends Model
{
    protected $fillable = ['job_id', 'stage_name', 'order'];

    public function job()
    {
        return $this->belongsTo(JobPost::class);
    }

    public function applicants()
    {
        return $this->hasMany(Applicant::class, 'current_stage_id');
    }
}
