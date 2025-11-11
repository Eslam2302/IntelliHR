<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Attendance extends Model
{
    use HasFactory;
    protected $fillable = [
        'check_in',
        'check_out',
        'is_late',
        'calculated_hours',
        'employee_id'
    ];

    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
        'calculated_hours' => 'float'
    ];



    public function employee()
    {
        return $this->belongsTo(Employee::class);
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

        // Authorization Principle 1: An employee always sees their own records.
        $allowedEmployeeIds[] = $currentEmployeeId;

        // Authorization Principle 2. Check for managerial subordinates.
        // If the employee model has subordinates (they are a manager).
        if ($employeeModel->subordinates->isNotEmpty()) {

            // Get the IDs of all direct subordinates reporting to this user.
            $subordinateIds = $employeeModel->subordinates->pluck('id')->toArray();
            $allowedEmployeeIds = array_merge($allowedEmployeeIds, $subordinateIds);
        }

        // 4. Apply the final filter to the query.
        // The query will only return attendance records where the employee_id is in the allowed list.
        return $query->whereIn('employee_id', array_unique($allowedEmployeeIds));
    }
}
