<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Goal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'evaluation_cycle_id',
        'set_by',
        'title',
        'description',
        'type',
        'category',
        'success_criteria',
        'start_date',
        'target_date',
        'weight',
        'status',
        'progress_percentage',
        'completion_notes',
        'achievement_level',
        'self_rating',
        'manager_rating',
        'manager_comments',
    ];

    protected $casts = [
        'success_criteria' => 'array',
        'start_date' => 'date',
        'target_date' => 'date',
    ];

    /**
     * Relationships
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function evaluationCycle()
    {
        return $this->belongsTo(EvaluationCycle::class);
    }

    public function setBy()
    {
        return $this->belongsTo(Employee::class, 'set_by');
    }

    public function progressUpdates()
    {
        return $this->hasMany(GoalProgressUpdate::class)->orderBy('update_date', 'desc');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['not_started', 'in_progress', 'at_risk']);
    }

    public function scopeOverdue($query)
    {
        return $query->whereNotIn('status', ['completed', 'cancelled'])
            ->where('target_date', '<', now());
    }

    public function scopeForCycle($query, int $cycleId)
    {
        return $query->where('evaluation_cycle_id', $cycleId);
    }

    /**
     * Helper Methods
     */
    public function isOverdue(): bool
    {
        return ! in_array($this->status, ['completed', 'cancelled']) &&
               now() > $this->target_date;
    }

    public function getDaysRemaining(): ?int
    {
        if (in_array($this->status, ['completed', 'cancelled'])) {
            return null;
        }

        return now()->diffInDays($this->target_date, false);
    }

    public function addProgressUpdate(array $data): GoalProgressUpdate
    {
        $update = $this->progressUpdates()->create([
            'updated_by' => $data['updated_by'],
            'update_note' => $data['update_note'],
            'progress_percentage' => $data['progress_percentage'],
            'status' => $data['status'],
            'update_date' => $data['update_date'] ?? now(),
        ]);

        // Update goal progress
        $this->update([
            'progress_percentage' => $data['progress_percentage'],
            'status' => $data['status'],
        ]);

        return $update;
    }

    public function markComplete(array $data): void
    {
        $this->update([
            'status' => 'completed',
            'progress_percentage' => 100,
            'completion_notes' => $data['completion_notes'],
            'achievement_level' => $data['achievement_level'],
            'self_rating' => $data['self_rating'] ?? null,
        ]);
    }
}
