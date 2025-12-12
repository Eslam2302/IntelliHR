<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ExpenseRequest;

class ExpenseDTO
{
    public function __construct(
        public readonly int     $employee_id,
        public readonly int     $category_id,
        public readonly float   $amount,
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
        return new self(
            employee_id: $request->validated('employee_id'),
            category_id: $request->validated('category_id'),
            amount: (float) $request->validated('amount'),
            expense_date: $request->validated('expense_date') ?? null,
            receipt_path: $request->file('receipt_path') ?? $request->validated('receipt_path') ?? null,
            status: $request->validated('status') ?? null,
            notes: $request->validated('notes') ?? null,
        );
    }

    /**
     * Convert DTO into an array for mass assignment.
     */
    public function toArray(): array
    {
        $data = [
            'employee_id'  => $this->employee_id,
            'category_id'  => $this->category_id,
            'amount'       => $this->amount,
            'expense_date' => $this->expense_date,
            'receipt_path' => $this->receipt_path,
            'status'       => $this->status,
            'notes'        => $this->notes,
        ];
        // Remove null values to prevent overwriting existing DB values
        return array_filter($data, fn($value) => !is_null($value));
    }
}
