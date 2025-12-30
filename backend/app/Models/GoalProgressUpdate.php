<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GoalProgressUpdate extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'updated_by',
        'update_note',
        'progress_percentage',
        'status',
        'update_date',
    ];

    protected $casts = [
        'update_date' => 'date',
    ];

    /**
     * Relationships
     */
    public function goal()
    {
        return $this->belongsTo(Goal::class);
    }

    public function updatedBy()
    {
        return $this->belongsTo(Employee::class, 'updated_by');
    }
}
