<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AllowanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'   => $this->id,

            'employee_id' => $this->employee_id,
            'employee'    => new EmployeeResource($this->whenLoaded('employee')),

            'payroll_id'  => $this->payroll_id,
            'payroll'     => new PayrollResource($this->whenLoaded('payroll')),

            'type'        => $this->type,
            'amount'      => (float) $this->amount,

            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'  => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
