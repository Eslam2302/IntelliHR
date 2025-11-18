<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ContractRequest;

class ContractDTO
{
    public function __construct(
        public readonly ?int $employee_id,
        public readonly string $contract_type,
        public readonly ?int $salary,
        public readonly string $terms,
        public readonly string $start_date,
        public readonly string $end_date,
    ) {}

    public static function fromRequest(ContractRequest $request): self
    {
        return new self(
            employee_id: $request->validated('employee_id'),
            contract_type: $request->validated('contract_type'),
            salary: $request->validated('salary'),
            terms: $request->validated('terms'),
            start_date: $request->validated('start_date'),
            end_date: $request->validated('end_date'),

        );
    }

    public function toArray(): array
    {
        return [
            'employee_id' => $this->employee_id,
            'contract_type' => $this->contract_type,
            'salary' => $this->salary,
            'terms' => $this->terms,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date
        ];
    }
}