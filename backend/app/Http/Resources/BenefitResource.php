<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BenefitResource extends JsonResource
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

            'employee' => $this->relationLoaded('employee') && $this->employee
                ? [
                    'id' => $this->employee->id,
                    'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
                    'deleted_at' => $this->employee->deleted_at?->toDateTimeString(),
                ]
                : null,

            'benefit_type' => $this->benefit_type,

            'amount' => $this->amount,
            'is_deduction' => $this->is_deduction,

            'start_date' => $this->start_date,
            'end_date' => $this->end_date,

            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->deleted_at?->toDateTimeString(),
        ];
    }
}
