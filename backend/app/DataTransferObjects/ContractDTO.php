<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ContractRequest;
use Carbon\Carbon;

class ContractDTO
{
    public function __construct(
        public readonly ?int $employee_id,
        public readonly ?string $contract_type,
        public readonly ?float $salary,
        public readonly ?string $terms,
        public readonly ?string $start_date,
        public readonly ?string $end_date,
        public readonly ?int $probation_period_days,

    ) {}

    public static function fromRequest(ContractRequest $request): self
    {
        $contract = $request->route('contract');
        $isUpdate = !empty($contract);
        
        return new self(
            employee_id: $isUpdate
                ? ($request->validated('employee_id') ?? $contract->employee_id)
                : $request->validated('employee_id'),
            contract_type: $isUpdate
                ? ($request->validated('contract_type') ?? $contract->contract_type)
                : $request->validated('contract_type'),
            salary: $request->validated('salary') ? (float) $request->validated('salary') : null,
            terms: $request->validated('terms'),
            start_date: $isUpdate
                ? ($request->validated('start_date') ?? ($contract->start_date ? self::toDateStringValue($contract->start_date) : null))
                : $request->validated('start_date'),
            end_date: $request->validated('end_date') ?? ($isUpdate && $contract->end_date ? self::toDateStringValue($contract->end_date) : null),
            probation_period_days: $request->validated('probation_period_days') ?? ($isUpdate ? $contract->probation_period_days : null),
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
            'end_date' => $this->end_date,
            'probation_period_days' => $this->probation_period_days ? $this->probation_period_days : 90 ,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['employee_id'], $data['start_date']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }

    private static function toDateStringValue(mixed $value): string
    {
        if ($value instanceof Carbon) {
            return $value->toDateString();
        }
        if (is_string($value)) {
            return Carbon::parse($value)->toDateString();
        }
        return (string) $value;
    }
}
