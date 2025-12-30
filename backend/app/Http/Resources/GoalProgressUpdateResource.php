<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalProgressUpdateResource extends JsonResource
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
            'updated_by' => new EmployeeResource($this->whenLoaded('updatedBy')),
            'update_note' => $this->update_note,
            'progress_percentage' => $this->progress_percentage,
            'status' => $this->status,
            'update_date' => $this->update_date->format('Y-m-d'),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
