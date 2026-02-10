<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\HiringStageResource;
use App\Http\Resources\JobPostResource;
use App\Http\Resources\InterviewResource;

class ApplicantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_id' => $this->job_id,
            'job' => new JobPostResource($this->whenLoaded('job')),
            'current_stage_id' => $this->current_stage_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_employee' => $this->is_employee,
            'status' => $this->status,
            'source' => $this->source,
            'experience_years' => $this->experience_years,
            'current_stage' => new HiringStageResource($this->whenLoaded('currentStage')),
            'resume_path' => $this->resume_path,
            'applied_at' => $this->applied_at,
            // AI Analysis fields
            'ai_score' => $this->ai_score,
            'ai_recommendation' => $this->ai_recommendation,
            'ai_analysis_status' => $this->ai_analysis_status,
            'ai_analyzed_at' => $this->ai_analyzed_at,
            'ai_summary' => $this->when($this->ai_analysis, function () {
                return [
                    'matched_skills' => $this->ai_matched_skills,
                    'missing_skills' => $this->ai_missing_skills,
                    'overall_assessment' => $this->ai_analysis['overall_assessment'] ?? null,
                ];
            }),
            // 'interviews' => InterviewResource::collection($this->whenLoaded('interviews')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
