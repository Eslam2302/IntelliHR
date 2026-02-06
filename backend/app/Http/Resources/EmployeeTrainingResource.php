<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeTrainingResource extends JsonResource
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
            'training_id' => $this->training_id,
            'status' => $this->status,
            'completion_date' => $this->completion_date,
            'employee' => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => trim(($this->employee->first_name ?? '') . ' ' . ($this->employee->last_name ?? '')),
                ] : null;
            }),
            'training_session' => $this->whenLoaded('training', function () {
                return $this->training ? [
                    'id' => $this->training->id,
                    'title' => $this->training->title ?? null,
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
