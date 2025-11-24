<?php

namespace App\DataTransferObjects;

use App\Http\Requests\DeductionRequest;

class DeductionDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly ?int $payroll_id,
        public readonly string $type,
        public readonly float $amount,
    ) {}

    public static function fromRequest(DeductionRequest $request): self
    {
        return new self(
            employee_id: $request->validated('employee_id'),
            payroll_id: $request->validated('payroll_id') ?? null,
            type: $request->validated('type'),
            amount: (float) $request->validated('amount'),
        );
    }

    public function toArray()
    {
        return [
            'employee_id'   => $this->employee_id,
            'payroll_id'    => $this->payroll_id,
            'type'          => $this->type,
            'amount'        => (float) $this->amount
        ];
    }
}
