<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeaveTypeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'description'       => $this->description,
            'max_days_per_year' => $this->max_days_per_year,
            'is_paid'           => (bool) $this->is_paid,
            'requires_proof'    => (bool) $this->requires_proof,
            'created_at'        => $this->created_at?->format('Y-m-d H:i'),
            'updated_at'        => $this->updated_at?->format('Y-m-d H:i'),
        ];
    }
}
