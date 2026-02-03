<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
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

            'employee' => $this->employee?->id ? [
                'id' => $this->employee->id,
                'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
            ] : null,

            'contract_type' => $this->contract_type,
            'probation_period_days' => $this->probation_period_days,
            'salary' => $this->salary,
            'terms' => $this->terms,

            'start_date' => $this->start_date?->format('Y-m-d'),
            'end_date' => $this->end_date?->format('Y-m-d'),

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->deleted_at?->toDateTimeString(),
        ];
    }
}
