<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', function () {
                if (!$this->employee) {
                    return null;
                }
                return [
                    'id' => $this->employee->id,
                    'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
                    'first_name' => $this->employee->first_name,
                    'last_name' => $this->employee->last_name,
                ];
            }),
            'date' => $this->date?->format('Y-m-d'),
            'check_in' => $this->check_in?->format('Y-m-d H:i:s'),
            'check_out' => $this->check_out?->format('Y-m-d H:i:s'),
            'is_late' => $this->is_late ?? false,
            'calculated_hours' => $this->calculated_hours,
            'location' => $this->location,
            'check_in_ip' => $this->check_in_ip,
            'check_out_ip' => $this->check_out_ip,
            'notes' => $this->notes,
            'status' => $this->status ?? 'present',
            'break_duration_minutes' => $this->break_duration_minutes,
            'overtime_hours' => $this->overtime_hours,
            'worked_hours' => $this->getWorkedHours(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
