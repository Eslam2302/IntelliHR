<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPost extends Model
{
    protected $fillable = [
        'title',
        'description',
        'requirements',
        'responsibilities',
        'department_id',
        'job_type',
        'status',
        'posted_at',
        'linkedin_job_id'
    ];

    public function applicants()
    {
        return $this->hasMany(Applicant::class, 'job_id');
    }

    public function hiringStages()
    {
        return $this->hasMany(HiringStage::class, 'job_id')->orderBy('order');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
