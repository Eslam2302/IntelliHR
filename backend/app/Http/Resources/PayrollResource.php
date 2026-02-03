<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollResource extends JsonResource
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
            'employee' => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
                    'deleted_at' => $this->employee->deleted_at?->format('Y-m-d H:i:s'),
                ] : null;
            }),

            'year' => (int) $this->year,
            'month' => (int) $this->month,

            'basic_salary' => (float) $this->basic_salary,
            'total_allowances' => (float) $this->allowances,
            'total_deductions' => (float) $this->deductions,

            'net_pay' => (float) $this->net_pay,
            'payment_status' => $this->payment_status ?? 'pending',
            'processed_at' => $this->processed_at?->format('Y-m-d H:i:s'),
            'paid_at' => $this->paid_at?->format('Y-m-d H:i:s'),

            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
        ];
    }
}
