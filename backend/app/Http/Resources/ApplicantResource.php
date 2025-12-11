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
            'job' => new JobPostResource($this->whenLoaded('job')),
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
            // 'interviews' => InterviewResource::collection($this->whenLoaded('interviews')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
