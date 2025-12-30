<?php

namespace App\DataTransferObjects;

use App\Http\Requests\PerformanceReviewRequest;

class PerformanceReviewDTO
{
    public function __construct(
        public readonly int $evaluationCycleId,
        public readonly int $employeeId,
        public readonly ?int $reviewerId,
        public readonly ?string $status,
        // Self Assessment
        public readonly ?string $selfAssessmentSummary,
        public readonly ?array $selfAssessmentAchievements,
        public readonly ?array $selfAssessmentChallenges,
        public readonly ?array $selfAssessmentGoals,
        // Manager Review
        public readonly ?string $managerSummary,
        public readonly ?array $managerStrengths,
        public readonly ?array $managerAreasForImprovement,
        public readonly ?array $managerGoalsForNextPeriod,
        public readonly ?string $managerAdditionalComments,
        // Final Rating
        public readonly ?string $overallRating,
        public readonly ?float $overallScore,
        // Outcomes
        public readonly bool $promotionRecommended,
        public readonly ?float $salaryIncreasePercentage,
        public readonly ?float $bonusAmount,
        public readonly ?array $recommendedTraining,
        public readonly ?array $developmentPlan,
        // Acknowledgment
        public readonly ?string $employeeAcknowledgmentComments,
    ) {}

    public static function fromRequest(PerformanceReviewRequest $request): self
    {
        // For create operations, these fields are required (validation handles this)
        // We use validated() to ensure they pass validation
        // For optional fields, validated() returns null if not present, which is correct
        return new self(
            evaluationCycleId: $request->validated('evaluation_cycle_id'),
            employeeId: $request->validated('employee_id'),
            reviewerId: $request->validated('reviewer_id'),
            status: $request->validated('status'),
            selfAssessmentSummary: $request->validated('self_assessment_summary'),
            selfAssessmentAchievements: $request->validated('self_assessment_achievements'),
            selfAssessmentChallenges: $request->validated('self_assessment_challenges'),
            selfAssessmentGoals: $request->validated('self_assessment_goals'),
            managerSummary: $request->validated('manager_summary'),
            managerStrengths: $request->validated('manager_strengths'),
            managerAreasForImprovement: $request->validated('manager_areas_for_improvement'),
            managerGoalsForNextPeriod: $request->validated('manager_goals_for_next_period'),
            managerAdditionalComments: $request->validated('manager_additional_comments'),
            overallRating: $request->validated('overall_rating'),
            overallScore: $request->validated('overall_score'),
            promotionRecommended: $request->has('promotion_recommended') ? $request->boolean('promotion_recommended') : false,
            salaryIncreasePercentage: $request->validated('salary_increase_percentage'),
            bonusAmount: $request->validated('bonus_amount'),
            recommendedTraining: $request->validated('recommended_training'),
            developmentPlan: $request->validated('development_plan'),
            employeeAcknowledgmentComments: $request->validated('employee_acknowledgment_comments'),
        );
    }

    public static function fromRequestForUpdate(
        PerformanceReviewRequest $request,
        \App\Models\PerformanceReview $review
    ): self {
        // For updates, preserve existing evaluation_cycle_id and employee_id
        // These should not be changed after creation (they're part of unique constraint)
        // Only use new values if explicitly provided and valid (not 0 or empty)
        $evaluationCycleId = $review->evaluation_cycle_id;
        if ($request->has('evaluation_cycle_id') && $request->input('evaluation_cycle_id')) {
            $evaluationCycleId = $request->validated('evaluation_cycle_id');
        }
        
        $employeeId = $review->employee_id;
        if ($request->has('employee_id') && $request->input('employee_id')) {
            $employeeId = $request->validated('employee_id');
        }
        
        // For optional fields, use validated() which returns null if not present
        // Then fall back to existing values for updates
        return new self(
            evaluationCycleId: $evaluationCycleId,
            employeeId: $employeeId,
            reviewerId: $request->validated('reviewer_id') ?? $review->reviewer_id,
            status: $request->validated('status') ?? $review->status,
            selfAssessmentSummary: $request->validated('self_assessment_summary') ?? $review->self_assessment_summary,
            selfAssessmentAchievements: $request->validated('self_assessment_achievements') ?? $review->self_assessment_achievements,
            selfAssessmentChallenges: $request->validated('self_assessment_challenges') ?? $review->self_assessment_challenges,
            selfAssessmentGoals: $request->validated('self_assessment_goals') ?? $review->self_assessment_goals,
            managerSummary: $request->validated('manager_summary') ?? $review->manager_summary,
            managerStrengths: $request->validated('manager_strengths') ?? $review->manager_strengths,
            managerAreasForImprovement: $request->validated('manager_areas_for_improvement') ?? $review->manager_areas_for_improvement,
            managerGoalsForNextPeriod: $request->validated('manager_goals_for_next_period') ?? $review->manager_goals_for_next_period,
            managerAdditionalComments: $request->validated('manager_additional_comments') ?? $review->manager_additional_comments,
            overallRating: $request->validated('overall_rating') ?? $review->overall_rating,
            overallScore: $request->validated('overall_score') ?? $review->overall_score,
            promotionRecommended: $request->has('promotion_recommended') ? $request->boolean('promotion_recommended') : $review->promotion_recommended,
            salaryIncreasePercentage: $request->validated('salary_increase_percentage') ?? $review->salary_increase_percentage,
            bonusAmount: $request->validated('bonus_amount') ?? $review->bonus_amount,
            recommendedTraining: $request->validated('recommended_training') ?? $review->recommended_training,
            developmentPlan: $request->validated('development_plan') ?? $review->development_plan,
            employeeAcknowledgmentComments: $request->validated('employee_acknowledgment_comments') ?? $review->employee_acknowledgment_comments,
        );
    }
    

    public function toArray(): array
    {
        $data = [
            'evaluation_cycle_id' => $this->evaluationCycleId,
            'employee_id' => $this->employeeId,
            'reviewer_id' => $this->reviewerId,
            'status' => $this->status,
            'self_assessment_summary' => $this->selfAssessmentSummary,
            'self_assessment_achievements' => $this->selfAssessmentAchievements,
            'self_assessment_challenges' => $this->selfAssessmentChallenges,
            'self_assessment_goals' => $this->selfAssessmentGoals,
            'manager_summary' => $this->managerSummary,
            'manager_strengths' => $this->managerStrengths,
            'manager_areas_for_improvement' => $this->managerAreasForImprovement,
            'manager_goals_for_next_period' => $this->managerGoalsForNextPeriod,
            'manager_additional_comments' => $this->managerAdditionalComments,
            'overall_rating' => $this->overallRating,
            'overall_score' => $this->overallScore,
            'salary_increase_percentage' => $this->salaryIncreasePercentage,
            'bonus_amount' => $this->bonusAmount,
            'recommended_training' => $this->recommendedTraining,
            'development_plan' => $this->developmentPlan,
            'employee_acknowledgment_comments' => $this->employeeAcknowledgmentComments,
        ];
        
        // Always include promotion_recommended (defaults to false if not provided)
        $data['promotion_recommended'] = $this->promotionRecommended;
        
        return $data;
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        
        // Exclude immutable fields from updates (they shouldn't be changed after creation)
        // These are part of the unique constraint and should remain constant
        unset($data['evaluation_cycle_id'], $data['employee_id']);
        
        // Filter out null values and empty strings for partial updates
        // But keep boolean false values as they are valid
        $filtered = [];
        foreach ($data as $key => $value) {
            if ($value !== null && $value !== '') {
                $filtered[$key] = $value;
            } elseif ($key === 'promotion_recommended' && $value === false) {
                // Always include promotion_recommended even if false
                $filtered[$key] = $value;
            }
        }
        return $filtered;
    }
}

