<?php

namespace App\DataTransferObjects;

use App\Http\Requests\PayrollRequest;

class PayrollDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly int $year,
        public readonly int $month,
        public readonly float $basic_salary,
        public readonly float $allowances,
        public readonly float $deductions,
        public readonly ?string $processed_at,
    ) {}

    public static function fromRequest(PayrollRequest $request): self
    {
        return new self(
            employee_id: $request->validated('employee_id'),
            year: $request->validated('year'),
            month: $request->validated('month'),
            basic_salary: (float) $request->validated('basic_salary'),
            allowances: (float) ($request->validated('allowances') ?? 0),
            deductions: (float) ($request->validated('deductions') ?? 0),
            processed_at: $request->validated('processed_at') ?? null,
        );
    }

    public function toArray()
    {
        return [
            'employee_id'   => $this->employee_id,
            'year'          => $this->year,
            'month'         => $this->month,
            'basic_salary'  => (float) $this->basic_salary,
            'allowances'    => (float) $this->allowances,
            'deductions'    => (float) $this->deductions,
            'processed_at'  => $this->processed_at,
        ];
    }
}
