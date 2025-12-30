<?php

namespace App\DataTransferObjects;

use App\Http\Requests\PayrollRequest;

class PayrollDTO
{
    public function __construct(
        public readonly ?int $employee_id,
        public readonly ?int $year,
        public readonly ?int $month,
        public readonly ?float $basic_salary,
        public readonly ?float $allowances,
        public readonly ?float $deductions,
        public readonly ?string $processed_at,
    ) {}

    public static function fromRequest(PayrollRequest $request): self
    {
        $payroll = $request->route('payroll');
        $isUpdate = !empty($payroll);
        
        return new self(
            employee_id: $isUpdate
                ? ($request->validated('employee_id') ?? $payroll->employee_id)
                : $request->validated('employee_id'),
            year: $isUpdate
                ? ($request->validated('year') ?? $payroll->year)
                : $request->validated('year'),
            month: $isUpdate
                ? ($request->validated('month') ?? $payroll->month)
                : $request->validated('month'),
            basic_salary: $request->validated('basic_salary') ? (float) $request->validated('basic_salary') : null,
            allowances: $request->validated('allowances') !== null ? (float) $request->validated('allowances') : null,
            deductions: $request->validated('deductions') !== null ? (float) $request->validated('deductions') : null,
            processed_at: $request->validated('processed_at') ?? ($isUpdate && $payroll->processed_at ? $payroll->processed_at->toDateString() : null),
        );
    }

    public function toArray()
    {
        return [
            'employee_id'   => $this->employee_id,
            'year'          => $this->year,
            'month'         => $this->month,
            'basic_salary'  => $this->basic_salary !== null ? (float) $this->basic_salary : null,
            'allowances'    => $this->allowances !== null ? (float) $this->allowances : null,
            'deductions'    => $this->deductions !== null ? (float) $this->deductions : null,
            'processed_at'  => $this->processed_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['employee_id'], $data['year'], $data['month']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
