<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,

            'employee_id'   => $this->employee_id,
            'employee'      => new EmployeeResource($this->whenLoaded('employee')),

            'category_id'   => $this->category_id,
            'category'      => new ExpenseCategoryResource($this->whenLoaded('category')),

            'amount'        => (float) $this->amount,
            'expense_date'  => $this->expense_date?->format('Y-m-d'),

            'status'        => $this->status,
            'notes'         => $this->notes,

            'receipt_path'  => $this->receipt_path,

            'created_at'    => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'    => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}