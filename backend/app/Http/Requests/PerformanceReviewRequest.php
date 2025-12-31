<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PerformanceReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled by middleware
        // This ensures user is authenticated
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $reviewId = $this->route('performance_review')?->id ?? $this->route('performance_review');
        $isUpdate = !empty($reviewId);

        return [
            'evaluation_cycle_id' => [$isUpdate ? 'sometimes' : 'required', 'exists:evaluation_cycles,id'],
            'employee_id' => [$isUpdate ? 'sometimes' : 'required', 'exists:employees,id'],
            'reviewer_id' => ['nullable', 'exists:employees,id'],
            'status' => ['nullable', Rule::in([
                'not_started',
                'self_assessment_in_progress',
                'self_assessment_submitted',
                'manager_review_in_progress',
                'manager_review_submitted',
                'awaiting_acknowledgment',
                'acknowledged',
                'completed',
            ])],

            // Self Assessment
            'self_assessment_summary' => ['nullable', 'string'],
            'self_assessment_achievements' => ['nullable', 'array'],
            'self_assessment_achievements.*' => ['string', 'max:500'],
            'self_assessment_challenges' => ['nullable', 'array'],
            'self_assessment_challenges.*' => ['string', 'max:500'],
            'self_assessment_goals' => ['nullable', 'array'],
            'self_assessment_goals.*' => ['string', 'max:500'],

            // Manager Review
            'manager_summary' => ['nullable', 'string'],
            'manager_strengths' => ['nullable', 'array'],
            'manager_strengths.*' => ['string', 'max:500'],
            'manager_areas_for_improvement' => ['nullable', 'array'],
            'manager_areas_for_improvement.*' => ['string', 'max:500'],
            'manager_goals_for_next_period' => ['nullable', 'array'],
            'manager_goals_for_next_period.*' => ['string', 'max:500'],
            'manager_additional_comments' => ['nullable', 'string'],

            // Final Rating
            'overall_rating' => ['nullable', 'string', 'max:50'],
            'overall_score' => ['nullable', 'numeric', 'min:0', 'max:5'],

            // Outcomes
            'promotion_recommended' => ['boolean'],
            'salary_increase_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'bonus_amount' => ['nullable', 'numeric', 'min:0'],
            'recommended_training' => ['nullable', 'array'],
            'recommended_training.*' => ['string', 'max:255'],
            'development_plan' => ['nullable', 'array'],

            // Acknowledgment
            'employee_acknowledgment_comments' => ['nullable', 'string'],
        ];
    }
}

