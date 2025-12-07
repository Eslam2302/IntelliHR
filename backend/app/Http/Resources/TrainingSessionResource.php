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
            'description' => $this->description,

            'trainer' => $this->whenLoaded('trainer', function () {
                return [
                    'id' => $this->trainer->id,
                    'type' => $this->trainer->type,
                    'employee' => $this->trainer->type === 'internal' && $this->trainer->employee ? [
                        'id' => $this->trainer->employee->id,
                        'name' => $this->trainer->employee->first_name . ' ' . $this->trainer->employee->last_name,
                        'email' => $this->trainer->employee->personal_email,
                    ] : null,
                    'name' => $this->trainer->type === 'external' ? $this->trainer->name : null,
                    'email' => $this->trainer->type === 'external' ? $this->trainer->email : null,
                    'phone' => $this->trainer->type === 'external' ? $this->trainer->phone : null,
                ];
            }),

            'department' => $this->whenLoaded('department', function () {
                return [
                    'id' => $this->department->id,
                    'name' => $this->department->name,
                ];
            }),

            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'  => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
