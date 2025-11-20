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

            'employee'       => [
                'id'         => $this->employee->id,
                'name'       => $this->employee->first_name . ' ' . $this->employee->last_name,
            ],
            'contract_type'  => $this->contract_type,
            'probation_period_days' => $this->probation_period_days,
            'salary'         => $this->salary,
            'terms'          => $this->terms,

            'start_date'     => $this->start_date,
            'end_date'       => $this->end_date,

            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}