<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EvaluationCycle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'type',
        'year',
        'period',
        'start_date',
        'end_date',
        'self_assessment_deadline',
        'manager_review_deadline',
        'calibration_deadline',
        'final_review_deadline',
        'status',
        'rating_scale',
        'include_self_assessment',
        'include_goals',
        'description',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'self_assessment_deadline' => 'date',
        'manager_review_deadline' => 'date',
        'calibration_deadline' => 'date',
        'final_review_deadline' => 'date',
        'rating_scale' => 'array',
        'include_self_assessment' => 'boolean',
        'include_goals' => 'boolean',
    ];

    /**
     * Relationships
     */
    public function reviews()
    {
        return $this->hasMany(PerformanceReview::class);
    }

    public function creator()
    {
        return $this->belongsTo(Employee::class, 'created_by');
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'cancelled');
    }

    public function scopeCurrentYear($query)
    {
        return $query->where('year', now()->year);
    }

    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeInProgress($query)
    {
        return $query->whereIn('status', [
            'published',
            'self_assessment_open',
            'manager_review_open',
            'calibration',
        ]);
    }

    /**
     * Helper Methods
     */
    public function isActive(): bool
    {
        return $this->status !== 'cancelled' &&
               $this->start_date <= now() &&
               $this->end_date >= now();
    }

    public function canSubmitSelfAssessment(): bool
    {
        return in_array($this->status, ['published', 'self_assessment_open']) &&
               now() <= $this->self_assessment_deadline;
    }

    public function canSubmitManagerReview(): bool
    {
        return in_array($this->status, ['self_assessment_open', 'manager_review_open']) &&
               now() <= $this->manager_review_deadline;
    }

    public function getCompletionPercentage(): float
    {
        $total = $this->reviews()->count();
        if ($total === 0) {
            return 0;
        }

        $completed = $this->reviews()
            ->whereIn('status', ['acknowledged', 'completed'])
            ->count();

        return round(($completed / $total) * 100, 2);
    }

    public function getStatistics(): array
    {
        $reviews = $this->reviews();

        return [
            'total_reviews' => $reviews->count(),
            'not_started' => $reviews->where('status', 'not_started')->count(),
            'self_assessment_in_progress' => $reviews->where('status', 'self_assessment_in_progress')->count(),
            'self_assessment_submitted' => $reviews->where('status', 'self_assessment_submitted')->count(),
            'manager_review_in_progress' => $reviews->where('status', 'manager_review_in_progress')->count(),
            'manager_review_submitted' => $reviews->where('status', 'manager_review_submitted')->count(),
            'completed' => $reviews->whereIn('status', ['acknowledged', 'completed'])->count(),
            'completion_percentage' => $this->getCompletionPercentage(),
            'overdue_self_assessments' => $this->getOverdueSelfAssessments(),
            'overdue_manager_reviews' => $this->getOverdueManagerReviews(),
        ];
    }

    private function getOverdueSelfAssessments(): int
    {
        if (now() <= $this->self_assessment_deadline) {
            return 0;
        }

        return $this->reviews()
            ->whereIn('status', ['not_started', 'self_assessment_in_progress'])
            ->count();
    }

    private function getOverdueManagerReviews(): int
    {
        if (now() <= $this->manager_review_deadline) {
            return 0;
        }

        return $this->reviews()
            ->whereIn('status', ['self_assessment_submitted', 'manager_review_in_progress'])
            ->count();
    }
}
