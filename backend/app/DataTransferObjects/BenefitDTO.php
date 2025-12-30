<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BenefitRequest;

class BenefitDTO
{

    public function __construct(
        public readonly int $employee_id,
        public readonly ?string $benefit_type,
        public readonly ?int $amount,
        public readonly ?bool $is_deduction,
        public readonly ?string $start_date,
        public readonly ?string $end_date,
    ) {}

    public static function fromRequest(BenefitRequest $request): self
    {
        $benefit = $request->route('benefit');
        $isUpdate = !empty($benefit);
        
        return new self(
            employee_id: $isUpdate 
                ? ($request->validated('employee_id') ?? $benefit->employee_id)
                : $request->validated('employee_id'),
            benefit_type: $isUpdate
                ? ($request->validated('benefit_type') ?? $benefit->benefit_type)
                : $request->validated('benefit_type'),
            amount: $request->validated('amount'),
            is_deduction: $request->has('is_deduction') ? $request->boolean('is_deduction') : null,
            start_date: $isUpdate
                ? ($request->validated('start_date') ?? ($benefit->start_date ? $benefit->start_date->toDateString() : null))
                : $request->validated('start_date'),
            end_date: $request->validated('end_date'),
        );
    }

    public function toArray(): array
    {
        return [
            'employee_id' => $this->employee_id,
            'benefit_type' => $this->benefit_type,
            'amount' => $this->amount,
            'is_deduction' => $this->is_deduction,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
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
