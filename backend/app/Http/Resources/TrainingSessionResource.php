<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainingSessionResource extends JsonResource
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
            'title' => $this->title,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'trainer_id' => $this->trainer_id,
            'department_id' => $this->department_id,
            'description' => $this->description,

            'trainer' => $this->whenLoaded('trainer', function () {
                $name = $this->trainer->type === 'internal' && $this->trainer->relationLoaded('employee') && $this->trainer->employee
                    ? trim($this->trainer->employee->first_name . ' ' . $this->trainer->employee->last_name)
                    : ($this->trainer->type === 'external' ? $this->trainer->name : null);
                return [
                    'id' => $this->trainer->id,
                    'name' => $name,
                ];
            }),

            'department' => $this->whenLoaded('department', function () {
                return $this->department ? [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ] : null;
            }),

            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'  => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
