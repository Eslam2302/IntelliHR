<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Attendance extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'check_out',
        'is_late',
        'calculated_hours',
        'location',
        'check_in_ip',
        'check_out_ip',
        'notes',
        'status',
        'break_duration_minutes',
        'overtime_hours',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'is_late' => 'boolean',
        'calculated_hours' => 'float',
        'break_duration_minutes' => 'integer',
        'overtime_hours' => 'float',
    ];



    /**
     * Relationships
     */
    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    /**
     * Query Scopes
     */
    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date', now()->month)
            ->whereYear('date', now()->year);
    }

    public function scopeLate($query)
    {
        return $query->where('is_late', true);
    }

    public function scopeOnTime($query)
    {
        return $query->where('is_late', false);
    }

    public function scopeForEmployee($query, int $employeeId)
    {
        return $query->where('employee_id', $employeeId);
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('date', $date);
    }

    public function scopeVisibleToUser($query, $user)
    {
        // Get the Employee model linked to the authenticated User.
        // This model holds the 'manager_id' and 'subordinates' relationship data.
        $employeeModel = $user->employee;

        // Safety check: If the user is not linked to an employee record, prevent access.
        if (!$employeeModel) {
            return $query->where('employee_id', $user->employee_id ?? 0);
        }

        $allowedEmployeeIds = [];
        $currentEmployeeId = $employeeModel->id;

        // Authorization Principle 1. An employee always sees their own records.
        $allowedEmployeeIds[] = $currentEmployeeId;

        // Authorization Principle 2. Check for managerial subordinates.
        // If the employee model has subordinates (they are a manager).
        if ($employeeModel->subordinates->isNotEmpty()) {

            // 3. Get the IDs of all direct subordinates reporting to this user.
            $subordinateIds = $employeeModel->subordinates->pluck('id')->toArray();
            $allowedEmployeeIds = array_merge($allowedEmployeeIds, $subordinateIds);
        }

        // 4. Apply the final filter to the query.
        // The query will only return attendance records where the employee_id is in the allowed list.
        return $query->whereIn('employee_id', array_unique($allowedEmployeeIds));
    }

    /**
     * Helper Methods
     */
    public function isLate(): bool
    {
        return $this->is_late ?? false;
    }

    public function hasCheckedOut(): bool
    {
        return !is_null($this->check_out);
    }

    public function getWorkedHours(): ?float
    {
        if (!$this->check_in || !$this->check_out) {
            return null;
        }

        $totalMinutes = $this->check_in->diffInMinutes($this->check_out);
        
        // Subtract break duration if exists
        if ($this->break_duration_minutes) {
            $totalMinutes -= $this->break_duration_minutes;
        }

        return round($totalMinutes / 60, 2);
    }

    /**
     * Accessors
     */
    public function getFormattedCheckInAttribute(): ?string
    {
        return $this->check_in ? $this->check_in->format('Y-m-d H:i:s') : null;
    }

    public function getFormattedCheckOutAttribute(): ?string
    {
        return $this->check_out ? $this->check_out->format('Y-m-d H:i:s') : null;
    }
}
