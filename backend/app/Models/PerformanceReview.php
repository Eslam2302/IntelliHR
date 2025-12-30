<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PerformanceReview extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'evaluation_cycle_id',
        'employee_id',
        'reviewer_id',
        'status',

        // Self Assessment
        'self_assessment_summary',
        'self_assessment_achievements',
        'self_assessment_challenges',
        'self_assessment_goals',
        'self_assessment_submitted_at',

        // Manager Review
        'manager_summary',
        'manager_strengths',
        'manager_areas_for_improvement',
        'manager_goals_for_next_period',
        'manager_additional_comments',
        'manager_review_submitted_at',

        // Final Rating
        'overall_rating',
        'overall_score',

        // Outcomes
        'promotion_recommended',
        'salary_increase_percentage',
        'bonus_amount',
        'recommended_training',
        'development_plan',

        // Acknowledgment
        'acknowledged_at',
        'employee_acknowledgment_comments',

        'completed_at',
    ];

    protected $casts = [
        'self_assessment_achievements' => 'array',
        'self_assessment_challenges' => 'array',
        'self_assessment_goals' => 'array',
        'self_assessment_submitted_at' => 'datetime',

        'manager_strengths' => 'array',
        'manager_areas_for_improvement' => 'array',
        'manager_goals_for_next_period' => 'array',
        'manager_review_submitted_at' => 'datetime',

        'overall_score' => 'decimal:2',

        'promotion_recommended' => 'boolean',
        'salary_increase_percentage' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'recommended_training' => 'array',
        'development_plan' => 'array',

        'acknowledged_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function evaluationCycle()
    {
        return $this->belongsTo(EvaluationCycle::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(Employee::class, 'reviewer_id');
    }

    public function ratings()
    {
        return $this->hasMany(ReviewRating::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class, 'evaluation_cycle_id', 'evaluation_cycle_id')
            ->where('employee_id', $this->employee_id);
    }

    /**
     * Scopes
     */
    public function scopePendingSelfAssessment($query)
    {
        return $query->whereIn('status', ['not_started', 'self_assessment_in_progress'])
            ->whereNull('self_assessment_submitted_at');
    }

    public function scopePendingManagerReview($query)
    {
        return $query->whereIn('status', ['self_assessment_submitted', 'manager_review_in_progress'])
            ->whereNull('manager_review_submitted_at');
    }

    public function scopeCompleted($query)
    {
        return $query->whereIn('status', ['acknowledged', 'completed']);
    }

    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeForReviewer($query, int $reviewerId)
    {
        return $query->where('reviewer_id', $reviewerId);
    }

    /**
     * Helper Methods
     */
    public function canEmployeeEdit(): bool
    {
        return in_array($this->status, ['not_started', 'self_assessment_in_progress']) &&
               $this->evaluationCycle->canSubmitSelfAssessment();
    }

    public function canManagerEdit(): bool
    {
        return in_array($this->status, ['self_assessment_submitted', 'manager_review_in_progress']) &&
               $this->evaluationCycle->canSubmitManagerReview();
    }

    public function calculateOverallScore(): float
    {
        $ratings = $this->ratings()->with('competency')->get();

        if ($ratings->isEmpty()) {
            return 0;
        }

        $totalWeight = 0;
        $weightedSum = 0;

        foreach ($ratings as $rating) {
            if ($rating->manager_rating) {
                $weight = $rating->competency->weight ?? 1;
                $totalWeight += $weight;
                $weightedSum += ($rating->manager_rating * $weight);
            }
        }

        return $totalWeight > 0 ? round($weightedSum / $totalWeight, 2) : 0;
    }

    public function getOverallRatingLabel(): string
    {
        if (! $this->overall_score) {
            return 'Not Rated';
        }

        $ratingScale = $this->evaluationCycle->rating_scale;

        if (! $ratingScale) {
            // Default scale
            if ($this->overall_score >= 4.5) {
                return 'Exceeds Expectations';
            }
            if ($this->overall_score >= 3.5) {
                return 'Meets Expectations';
            }
            if ($this->overall_score >= 2.5) {
                return 'Needs Improvement';
            }

            return 'Below Expectations';
        }

        foreach ($ratingScale as $scale) {
            if ($this->overall_score >= $scale['min'] && $this->overall_score <= $scale['max']) {
                return $scale['label'];
            }
        }

        return 'Not Rated';
    }

    public function isOverdue(): bool
    {
        $cycle = $this->evaluationCycle;

        if (in_array($this->status, ['not_started', 'self_assessment_in_progress']) &&
            now() > $cycle->self_assessment_deadline) {
            return true;
        }

        if (in_array($this->status, ['self_assessment_submitted', 'manager_review_in_progress']) &&
            now() > $cycle->manager_review_deadline) {
            return true;
        }

        return false;
    }

    public function getDaysUntilDeadline(): ?int
    {
        $cycle = $this->evaluationCycle;

        if (in_array($this->status, ['not_started', 'self_assessment_in_progress'])) {
            return now()->diffInDays($cycle->self_assessment_deadline, false);
        }

        if (in_array($this->status, ['self_assessment_submitted', 'manager_review_in_progress'])) {
            return now()->diffInDays($cycle->manager_review_deadline, false);
        }

        return null;
    }
}
