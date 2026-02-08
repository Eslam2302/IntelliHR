<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewRatingResource extends JsonResource
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
            'performance_review_id' => $this->performance_review_id,
            'performance_review' => $this->whenLoaded('performanceReview', function () {
                $pr = $this->performanceReview;
                return [
                    'id' => $pr->id,
                    'employee' => $pr->relationLoaded('employee') && $pr->employee ? [
                        'id' => $pr->employee->id,
                        'first_name' => $pr->employee->first_name,
                        'last_name' => $pr->employee->last_name,
                    ] : null,
                    'evaluation_cycle' => $pr->relationLoaded('evaluationCycle') && $pr->evaluationCycle ? [
                        'id' => $pr->evaluationCycle->id,
                        'name' => $pr->evaluationCycle->name,
                        'year' => $pr->evaluationCycle->year,
                    ] : null,
                ];
            }),
            'competency_id' => $this->competency_id,
            'competency' => new CompetencyResource($this->whenLoaded('competency')),
            'self_rating' => $this->self_rating,
            'self_rating_comment' => $this->self_rating_comment,
            'manager_rating' => $this->manager_rating,
            'manager_rating_comment' => $this->manager_rating_comment,
            'rating_gap' => $this->getRatingGap(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
