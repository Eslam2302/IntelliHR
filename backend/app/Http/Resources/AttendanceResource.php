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
            'id'  => $this->id,

            'employee' => [
                'id'   => $this->employee->id,
                'name'  => $this->employee->name,
            ],

            'check_in' => $this->check_in,
            'check_out' => $this->check_out ?? null,
            'is_late' => $this->is_late ?? null,
            'calculated_hours'  => $this->calculated_hours ?? null
        ];
    }
}