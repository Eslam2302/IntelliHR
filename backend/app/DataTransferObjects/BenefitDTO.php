<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BenefitRequest;

class BenefitDTO
{

    public function __construct(
        public readonly int $employee_id,
        public readonly string $benefit_type,
        public readonly ?int $amount,
        public  readonly ?string $is_deduction,
        public readonly ?string $start_date,
        public readonly ?string $end_date,
    ) {}

    public static function fromRequest(BenefitRequest $request): self
    {
        return new self(
            employee_id: $request->validated('employee_id'),
            benefit_type: $request->validated('benefit_type'),
            amount: $request->validated('amount'),
            is_deduction: $request->validated('is_deduction'),
            start_date: $request->validated('start_date'),
            end_date: $request->validated('end_date'),
        );
    }

    public function toArray(): array
    {
        return [
            'employee_id' => $this->employee_id,
            'benefit_type' => $this->benefit_type,
            'amount' => $this->amount,
            'is_deduction' => (bool) $this->is_deduction,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
        ];
    }
}
