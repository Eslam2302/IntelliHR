<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrainerResource extends JsonResource
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
            'type' => $this->type,
            'employee_id' => $this->employee_id,
            'employee' => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
                    'email' => $this->employee->work_email ?? null,
                    'phone' => $this->employee->phone ?? null,
                ] : null;
            }),
            'name' => $this->when($this->type === 'external', $this->name),
            'email' => $this->when($this->type === 'external', $this->email),
            'phone' => $this->when($this->type === 'external', $this->phone),
            'company' => $this->when($this->type === 'external', $this->company),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
