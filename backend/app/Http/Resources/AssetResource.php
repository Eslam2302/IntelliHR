<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
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
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'condition' => $this->condition,
            'status' => $this->status,
            'current_assignment' => $this->whenLoaded('currentAssignment', function () {
                return $this->currentAssignment ? [
                    'employee_id' => $this->currentAssignment->employee_id,
                    'assigned_date' => $this->currentAssignment->assigned_date?->format('Y-m-d'),
                    'return_date' => $this->currentAssignment->return_date?->format('Y-m-d'),
                ] : null;
            }),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
