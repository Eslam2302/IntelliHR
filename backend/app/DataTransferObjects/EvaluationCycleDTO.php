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
        public readonly ?bool $includeSelfAssessment,
        public readonly ?bool $includeGoals,
        public readonly ?string $description,
        public readonly int $createdBy,
    ) {}

    public static function fromRequest(EvaluationCycleRequest $request): self
    {
        // Check if this is an update request
        $isUpdate = !empty($request->route('evaluation_cycle'));
        
        return new self(
            name: $request->validated('name') ?? '',
            type: $request->validated('type') ?? '',
            year: $request->validated('year') ?? 0,
            period: $request->validated('period'),
            startDate: $request->validated('start_date') ?? '',
            endDate: $request->validated('end_date') ?? '',
            selfAssessmentDeadline: $request->validated('self_assessment_deadline') ?? '',
            managerReviewDeadline: $request->validated('manager_review_deadline') ?? '',
            calibrationDeadline: $request->validated('calibration_deadline'),
            finalReviewDeadline: $request->validated('final_review_deadline') ?? '',
            status: $request->validated('status'),
            ratingScale: $request->validated('rating_scale'),
            includeSelfAssessment: $request->has('include_self_assessment') 
                ? $request->boolean('include_self_assessment') 
                : ($isUpdate ? null : true), // null for update (don't change), true for create (default)
            includeGoals: $request->has('include_goals') 
                ? $request->boolean('include_goals') 
                : ($isUpdate ? null : true), // null for update (don't change), true for create (default)
            description: $request->validated('description'),
            createdBy: $isUpdate ? 0 : ($request->user()->employee->id ?? 0),
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove created_by from updates (shouldn't change)
        unset($data['created_by']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
    }
}
