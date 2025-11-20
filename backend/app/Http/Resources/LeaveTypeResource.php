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
            'id' => $this->id,

            // Basic info
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,

            // Leave entitlement
            'annual_entitlement' => $this->annual_entitlement,
            'accrual_policy' => $this->accrual_policy,
            'carry_over_limit' => $this->carry_over_limit,

            // Request rules
            'min_request_days' => $this->min_request_days,
            'max_request_days' => $this->max_request_days,

            // Workflow
            'requires_hr_approval' => $this->requires_hr_approval,
            'requires_proof' => $this->requires_proof,

            // Status
            'payment_type' => $this->payment_type,
            'is_active' => $this->is_active,

            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}