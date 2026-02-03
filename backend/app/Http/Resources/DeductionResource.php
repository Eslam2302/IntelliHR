<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeductionResource extends JsonResource
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
            'employee'    => $this->whenLoaded('employee', function () {
                return $this->employee ? [
                    'id' => $this->employee->id,
                    'name' => trim($this->employee->first_name . ' ' . $this->employee->last_name),
                    'deleted_at' => $this->employee->deleted_at?->format('Y-m-d H:i:s'),
                ] : null;
            }),

            'payroll_id'  => $this->payroll_id,
            'payroll'     => $this->whenLoaded('payroll', function () {
                return $this->payroll ? [
                    'id' => $this->payroll->id,
                    'year' => (int) $this->payroll->year,
                    'month' => (int) $this->payroll->month,
                ] : null;
            }),

            'type'        => $this->type,
            'amount'      => (float) $this->amount,

            'created_at'  => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'  => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
