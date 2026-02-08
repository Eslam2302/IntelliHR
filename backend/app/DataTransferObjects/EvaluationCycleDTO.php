<?php

namespace App\DataTransferObjects;

use App\Http\Requests\EvaluationCycleRequest;

class EvaluationCycleDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $type,
        public readonly ?int $year,
        public readonly ?string $period,
        public readonly ?string $startDate,
        public readonly ?string $endDate,
        public readonly ?string $selfAssessmentDeadline,
        public readonly ?string $managerReviewDeadline,
        public readonly ?string $calibrationDeadline,
        public readonly ?string $finalReviewDeadline,
        public readonly ?string $status,
        public readonly ?array $ratingScale,
        public readonly ?bool $includeSelfAssessment,
        public readonly ?bool $includeGoals,
        public readonly ?string $description,
        public readonly ?int $createdBy,
    ) {}

    public static function fromRequest(EvaluationCycleRequest $request): self
    {
        $cycle = $request->route('evaluation_cycle');
        $isUpdate = !empty($cycle);

        return new self(
            name: $request->input('name'),
            type: $request->input('type'),
            year: $request->input('year') ? (int) $request->input('year') : null,
            period: $request->input('period'),
            startDate: $request->input('start_date'),
            endDate: $request->input('end_date'),
            selfAssessmentDeadline: $request->input('self_assessment_deadline'),
            managerReviewDeadline: $request->input('manager_review_deadline'),
            calibrationDeadline: $request->input('calibration_deadline'),
            finalReviewDeadline: $request->input('final_review_deadline'),
            status: $request->input('status', 'draft'),
            ratingScale: $request->input('rating_scale'),
            includeSelfAssessment: $request->has('include_self_assessment') ? $request->boolean('include_self_assessment') : null,
            includeGoals: $request->has('include_goals') ? $request->boolean('include_goals') : null,
            description: $request->input('description'),
            createdBy: $isUpdate ? null : ($request->user()->employee->id ?? null),
        );
    }

    public function toArray(): array
    {
        $data = [];
        
        if ($this->name !== null) {
            $data['name'] = $this->name;
        }
        if ($this->type !== null) {
            $data['type'] = $this->type;
        }
        if ($this->year !== null) {
            $data['year'] = $this->year;
        }
        if ($this->period !== null) {
            $data['period'] = $this->period;
        }
        if ($this->startDate !== null) {
            $data['start_date'] = $this->startDate;
        }
        if ($this->endDate !== null) {
            $data['end_date'] = $this->endDate;
        }
        if ($this->selfAssessmentDeadline !== null) {
            $data['self_assessment_deadline'] = $this->selfAssessmentDeadline;
        }
        if ($this->managerReviewDeadline !== null) {
            $data['manager_review_deadline'] = $this->managerReviewDeadline;
        }
        if ($this->calibrationDeadline !== null) {
            $data['calibration_deadline'] = $this->calibrationDeadline;
        }
        if ($this->finalReviewDeadline !== null) {
            $data['final_review_deadline'] = $this->finalReviewDeadline;
        }
        if ($this->status !== null) {
            $data['status'] = $this->status;
        }
        if ($this->ratingScale !== null) {
            $data['rating_scale'] = $this->ratingScale;
        }
        if ($this->includeSelfAssessment !== null) {
            $data['include_self_assessment'] = $this->includeSelfAssessment;
        }
        if ($this->includeGoals !== null) {
            $data['include_goals'] = $this->includeGoals;
        }
        if ($this->description !== null) {
            $data['description'] = $this->description;
        }
        if ($this->createdBy !== null) {
            $data['created_by'] = $this->createdBy;
        }
        
        return $data;
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove created_by from updates (shouldn't change)
        unset($data['created_by']);
        // Filter out empty strings for partial updates
        return array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
    }
}
