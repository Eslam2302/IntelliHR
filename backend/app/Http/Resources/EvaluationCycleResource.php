<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationCycleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type,
            'year' => $this->year,
            'period' => $this->period,

            'dates' => [
                'start_date' => $this->start_date->format('Y-m-d'),
                'end_date' => $this->end_date->format('Y-m-d'),
                'self_assessment_deadline' => $this->self_assessment_deadline->format('Y-m-d'),
                'manager_review_deadline' => $this->manager_review_deadline->format('Y-m-d'),
                'calibration_deadline' => $this->calibration_deadline?->format('Y-m-d'),
                'final_review_deadline' => $this->final_review_deadline->format('Y-m-d'),
            ],

            'status' => $this->status,
            'rating_scale' => $this->rating_scale,
            'include_self_assessment' => $this->include_self_assessment,
            'include_goals' => $this->include_goals,
            'description' => $this->description,

            'statistics' => $this->when($request->input('include_statistics'), function () {
                return $this->getStatistics();
            }),

            'created_by' => new EmployeeResource($this->whenLoaded('creator')),
            'reviews_count' => $this->when(isset($this->reviews_count), $this->reviews_count),

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
