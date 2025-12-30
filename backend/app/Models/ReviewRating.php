<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewRating extends Model
{
    use HasFactory;

    protected $fillable = [
        'performance_review_id',
        'competency_id',
        'self_rating',
        'self_rating_comment',
        'manager_rating',
        'manager_rating_comment',
    ];

    /**
     * Relationships
     */
    public function performanceReview()
    {
        return $this->belongsTo(PerformanceReview::class);
    }

    public function competency()
    {
        return $this->belongsTo(Competency::class);
    }

    /**
     * Helper Methods
     */
    public function getRatingGap(): ?int
    {
        if ($this->self_rating && $this->manager_rating) {
            return $this->manager_rating - $this->self_rating;
        }

        return null;
    }
}
