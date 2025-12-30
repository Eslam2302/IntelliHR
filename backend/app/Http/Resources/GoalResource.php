<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            'evaluation_cycle' => new EvaluationCycleResource($this->whenLoaded('evaluationCycle')),
            'set_by' => new EmployeeResource($this->whenLoaded('setBy')),

            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'category' => $this->category,
            'success_criteria' => $this->success_criteria,

            'dates' => [
                'start_date' => $this->start_date->format('Y-m-d'),
                'target_date' => $this->target_date->format('Y-m-d'),
            ],

            'weight' => $this->weight,
            'status' => $this->status,
            'progress_percentage' => $this->progress_percentage,

            'completion' => [
                'notes' => $this->completion_notes,
                'achievement_level' => $this->achievement_level,
                'self_rating' => $this->self_rating,
                'manager_rating' => $this->manager_rating,
                'manager_comments' => $this->manager_comments,
            ],

            'progress_updates' => GoalProgressUpdateResource::collection($this->whenLoaded('progressUpdates')),

            'metadata' => [
                'is_overdue' => $this->isOverdue(),
                'days_remaining' => $this->getDaysRemaining(),
            ],

            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
