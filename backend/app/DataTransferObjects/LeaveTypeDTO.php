<?php

namespace App\DataTransferObjects;

use App\Http\Requests\LeaveTypeRequest;

class LeaveTypeDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $code,
        public readonly int $annual_entitlement,
        public readonly string $accrual_policy,
        public readonly int $carry_over_limit,
        public readonly int $min_request_days,
        public readonly int $max_request_days,
        public readonly bool $requires_hr_approval,
        public readonly string $payment_type,
        public readonly bool $requires_proof,
        public readonly bool $is_active,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(LeaveTypeRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            code: $request->validated('code'),
            annual_entitlement: $request->validated('annual_entitlement'),
            accrual_policy: $request->validated('accrual_policy'),
            carry_over_limit: $request->validated('carry_over_limit'),
            min_request_days: $request->validated('min_request_days'),
            max_request_days: $request->validated('max_request_days'),
            requires_hr_approval: $request->validated('requires_hr_approval'),
            payment_type: $request->validated('payment_type'),
            requires_proof: $request->validated('requires_proof'),
            is_active: $request->validated('is_active') ?? true,
        );
    }

    /**
     * Create DTO from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            code: $data['code'],
            annual_entitlement: $data['annual_entitlement'],
            accrual_policy: $data['accrual_policy'],
            carry_over_limit: $data['carry_over_limit'],
            min_request_days: $data['min_request_days'],
            max_request_days: $data['max_request_days'],
            requires_hr_approval: $data['requires_hr_approval'],
            payment_type: $data['payment_type'],
            requires_proof: $data['requires_proof'],
            is_active: $data['is_active'] ?? true,
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'code' => $this->code,
            'annual_entitlement' => $this->annual_entitlement,
            'accrual_policy' => $this->accrual_policy,
            'carry_over_limit' => $this->carry_over_limit,
            'min_request_days' => $this->min_request_days,
            'max_request_days' => $this->max_request_days,
            'requires_hr_approval' => $this->requires_hr_approval,
            'payment_type' => $this->payment_type,
            'requires_proof' => $this->requires_proof,
            'is_active' => $this->is_active,
        ];
    }
}
