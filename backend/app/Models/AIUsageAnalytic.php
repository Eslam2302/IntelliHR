<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AIUsageAnalytic extends Model
{
    protected $fillable = [
        'feature_type',
        'user_id',
        'employee_id',
        'applicant_id',
        'conversation_id',
        'model',
        'tokens_used',
        'estimated_cost',
        'prompt_preview',
        'prompt_length',
        'response_length',
        'response_time_ms',
        'status',
        'error_message',
    ];

    protected $casts = [
        'tokens_used' => 'integer',
        'estimated_cost' => 'decimal:6',
        'prompt_length' => 'integer',
        'response_length' => 'integer',
        'response_time_ms' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relationships
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }

    public function conversation()
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }

    /**
     * Scopes
     */
    public function scopeForFeature($query, string $featureType)
    {
        return $query->where('feature_type', $featureType);
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeSuccessful($query)
    {
        return $query->where('status', 'success');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }
}
