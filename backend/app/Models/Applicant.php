<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Applicant extends Model
{
    protected $fillable = [
        'job_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'is_employee',
        'status',
        'source',
        'experience_years',
        'current_stage_id',
        'resume_path',
        'applied_at',
        'ai_score',
        'ai_analysis',
        'ai_matched_skills',
        'ai_missing_skills',
        'ai_recommendation',
        'ai_analyzed_at',
        'ai_analysis_status',
    ];

    protected $casts = [
        'ai_analysis' => 'array',
        'ai_matched_skills' => 'array',
        'ai_missing_skills' => 'array',
        'ai_analyzed_at' => 'datetime',
        'applied_at' => 'datetime',
    ];

    public function job()
    {
        return $this->belongsTo(JobPost::class, 'job_id');
    }

    public function interviews()
    {
        return $this->hasMany(Interview::class);
    }

    public function currentStage()
    {
        return $this->belongsTo(HiringStage::class, 'current_stage_id');
    }
}