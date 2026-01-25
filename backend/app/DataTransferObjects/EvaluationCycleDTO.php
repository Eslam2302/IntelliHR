<?php

namespace App\DataTransferObjects;

use App\Http\Requests\EvaluationCycleRequest;

class EvaluationCycleDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $type,
        public readonly int $year,
        public readonly ?string $period,
        public readonly string $startDate,
        public readonly string $endDate,
        public readonly string $selfAssessmentDeadline,
        public readonly string $managerReviewDeadline,
        public readonly ?string $calibrationDeadline,
        public readonly string $finalReviewDeadline,
        public readonly ?string $status,
        public readonly ?array $ratingScale,
        public readonly bool $includeSelfAssessment,
        public readonly bool $includeGoals,
        public readonly ?string $description,
        public readonly int $createdBy,
    ) {}

    public static function fromRequest(EvaluationCycleRequest $request): self
    {
        return new self(
            name: $request->input('name'),
            type: $request->input('type'),
            year: $request->input('year'),
            period: $request->input('period'),
            startDate: $request->input('start_date'),
            endDate: $request->input('end_date'),
            selfAssessmentDeadline: $request->input('self_assessment_deadline'),
            managerReviewDeadline: $request->input('manager_review_deadline'),
            calibrationDeadline: $request->input('calibration_deadline'),
            finalReviewDeadline: $request->input('final_review_deadline'),
            status: $request->input('status', 'draft'),
            ratingScale: $request->input('rating_scale'),
            includeSelfAssessment: $request->boolean('include_self_assessment', true),
            includeGoals: $request->boolean('include_goals', true),
            description: $request->input('description'),
            createdBy: $request->user()->employee->id,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'type' => $this->type,
            'year' => $this->year,
            'period' => $this->period,
            'start_date' => $this->startDate,
            'end_date' => $this->endDate,
            'self_assessment_deadline' => $this->selfAssessmentDeadline,
            'manager_review_deadline' => $this->managerReviewDeadline,
            'calibration_deadline' => $this->calibrationDeadline,
            'final_review_deadline' => $this->finalReviewDeadline,
            'status' => $this->status,
            'rating_scale' => $this->ratingScale,
            'include_self_assessment' => $this->includeSelfAssessment,
            'include_goals' => $this->includeGoals,
            'description' => $this->description,
            'created_by' => $this->createdBy,
        ];
    }
}
