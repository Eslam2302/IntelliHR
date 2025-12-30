<?php

namespace App\DataTransferObjects;

use App\Http\Requests\DeductionRequest;

class DeductionDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly ?int $payroll_id,
        public readonly ?string $type,
        public readonly ?float $amount,
    ) {}

    public static function fromRequest(DeductionRequest $request): self
    {
        $deduction = $request->route('deduction');
        $isUpdate = !empty($deduction);
        
        return new self(
            employee_id: $isUpdate
                ? ($request->validated('employee_id') ?? $deduction->employee_id)
                : $request->validated('employee_id'),
            payroll_id: $request->validated('payroll_id') ?? null,
            type: $isUpdate
                ? ($request->validated('type') ?? $deduction->type)
                : $request->validated('type'),
            amount: $request->validated('amount') ? (float) $request->validated('amount') : null,
        );
    }

    public function toArray()
    {
        return [
            'employee_id'   => $this->employee_id,
            'payroll_id'    => $this->payroll_id,
            'type'          => $this->type,
            'amount'        => $this->amount !== null ? (float) $this->amount : null
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove employee_id from updates (shouldn't change)
        unset($data['employee_id']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
