<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PerformanceReviewResource extends JsonResource
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
            'evaluation_cycle' => new EvaluationCycleResource($this->whenLoaded('evaluationCycle')),
            'employee' => new EmployeeResource($this->whenLoaded('employee')),
            'reviewer' => new EmployeeResource($this->whenLoaded('reviewer')),
            'status' => $this->status,

            'self_assessment' => [
                'summary' => $this->self_assessment_summary,
                'achievements' => $this->self_assessment_achievements,
                'challenges' => $this->self_assessment_challenges,
                'goals' => $this->self_assessment_goals,
                'submitted_at' => $this->self_assessment_submitted_at?->toIso8601String(),
            ],

            'manager_review' => [
                'summary' => $this->manager_summary,
                'strengths' => $this->manager_strengths,
                'areas_for_improvement' => $this->manager_areas_for_improvement,
                'goals_for_next_period' => $this->manager_goals_for_next_period,
                'additional_comments' => $this->manager_additional_comments,
                'submitted_at' => $this->manager_review_submitted_at?->toIso8601String(),
            ],

            'ratings' => ReviewRatingResource::collection($this->whenLoaded('ratings')),

            'overall_rating' => $this->overall_rating,
            'overall_score' => $this->overall_score,
            'overall_rating_label' => $this->getOverallRatingLabel(),

            'outcomes' => [
                'promotion_recommended' => $this->promotion_recommended,
                'salary_increase_percentage' => $this->salary_increase_percentage,
                'bonus_amount' => $this->bonus_amount,
                'recommended_training' => $this->recommended_training,
                'development_plan' => $this->development_plan,
            ],

            'acknowledgment' => [
                'acknowledged_at' => $this->acknowledged_at?->toIso8601String(),
                'comments' => $this->employee_acknowledgment_comments,
            ],

            'metadata' => [
                'can_employee_edit' => $this->canEmployeeEdit(),
                'can_manager_edit' => $this->canManagerEdit(),
                'can_employee_acknowledge' => $this->canEmployeeAcknowledge(),
                'can_complete' => $this->canComplete(),
                'is_overdue' => $this->isOverdue(),
                'days_until_deadline' => $this->getDaysUntilDeadline(),
                'is_current_user_employee' => $request->user() && $request->user()->relationLoaded('employee') && $request->user()->employee && $request->user()->employee->id === $this->employee_id,
                'is_current_user_reviewer' => $request->user() && $request->user()->relationLoaded('employee') && $request->user()->employee && $this->reviewer_id && $request->user()->employee->id === $this->reviewer_id,
            ],

            'completed_at' => $this->completed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
