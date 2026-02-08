<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ExpenseRequest;

class ExpenseDTO
{
    public function __construct(
        public readonly ?int     $employee_id,
        public readonly ?int     $category_id,
        public readonly ?float   $amount,
        public readonly ?string  $expense_date,
        public readonly null|string|\Illuminate\Http\UploadedFile $receipt_path,
        public readonly ?string $status,
        public readonly ?string $notes,
    ) {}

    /**
     * Create DTO instance from validated request.
     */
    public static function fromRequest(ExpenseRequest $request): self
    {
        $validated = $request->validated();
        // Check for update request (PUT, PATCH, or POST with expense parameter)
        $isUpdate = $request->isMethod('PUT') || $request->isMethod('PATCH') || 
                   ($request->isMethod('POST') && $request->route()->hasParameter('expense'));
        
        return new self(
            employee_id: isset($validated['employee_id']) ? (int) $validated['employee_id'] : null,
            category_id: isset($validated['category_id']) ? (int) $validated['category_id'] : null,
            amount: isset($validated['amount']) ? (float) $validated['amount'] : null,
            expense_date: $validated['expense_date'] ?? null,
            receipt_path: $request->file('receipt_path') ?? $validated['receipt_path'] ?? null,
            status: $validated['status'] ?? null,
            notes: $validated['notes'] ?? null,
        );
    }

    /**
     * Convert DTO into an array for mass assignment.
     */
    public function toArray(): array
    {
        $data = [];
        
        if ($this->employee_id !== null) {
            $data['employee_id'] = $this->employee_id;
        }
        if ($this->category_id !== null) {
            $data['category_id'] = $this->category_id;
        }
        if ($this->amount !== null) {
            $data['amount'] = $this->amount;
        }
        if ($this->expense_date !== null) {
            $data['expense_date'] = $this->expense_date;
        }
        if ($this->receipt_path !== null) {
            $data['receipt_path'] = $this->receipt_path;
        }
        if ($this->status !== null) {
            $data['status'] = $this->status;
        }
        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }
        
        return $data;
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove employee_id from updates (shouldn't change)
        unset($data['employee_id']);
        // Filter out empty strings and null values for partial updates
        // BUT always include notes if it's set (required on update)
        $filtered = array_filter($data, function ($value, $key) {
            // Always include notes if present (even if empty string, validation will catch it)
            if ($key === 'notes') {
                return true;
            }
            return $value !== null && $value !== '';
        }, ARRAY_FILTER_USE_BOTH);
        
        return $filtered;
    }
}
