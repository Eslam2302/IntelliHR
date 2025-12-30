<?php

namespace App\DataTransferObjects;

use App\Http\Requests\LeaveTypeRequest;

class LeaveTypeDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $code,
        public readonly ?int $annual_entitlement,
        public readonly ?string $accrual_policy,
        public readonly ?int $carry_over_limit,
        public readonly ?int $min_request_days,
        public readonly ?int $max_request_days,
        public readonly ?bool $requires_hr_approval,
        public readonly ?string $payment_type,
        public readonly ?bool $requires_attachment,
        public readonly ?bool $is_active,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(LeaveTypeRequest $request): self
    {
        $leaveType = $request->route('leave_type');
        $isUpdate = !empty($leaveType);
        
        return new self(
            name: $isUpdate
                ? ($request->validated('name') ?? $leaveType->name)
                : $request->validated('name'),
            code: $isUpdate
                ? ($request->validated('code') ?? $leaveType->code)
                : $request->validated('code'),
            annual_entitlement: $request->validated('annual_entitlement') ?? ($isUpdate ? $leaveType->annual_entitlement : null),
            accrual_policy: $isUpdate
                ? ($request->validated('accrual_policy') ?? $leaveType->accrual_policy)
                : $request->validated('accrual_policy'),
            carry_over_limit: $request->validated('carry_over_limit') ?? ($isUpdate ? $leaveType->carry_over_limit : null),
            min_request_days: $request->validated('min_request_days') ?? ($isUpdate ? $leaveType->min_request_days : null),
            max_request_days: $request->validated('max_request_days') ?? ($isUpdate ? $leaveType->max_request_days : null),
            requires_hr_approval: $request->has('requires_hr_approval') ? $request->boolean('requires_hr_approval') : ($isUpdate ? $leaveType->requires_hr_approval : null),
            payment_type: $isUpdate
                ? ($request->validated('payment_type') ?? $leaveType->payment_type)
                : $request->validated('payment_type'),
            requires_attachment: $request->has('requires_attachment') ? $request->boolean('requires_attachment') : ($isUpdate ? $leaveType->requires_attachment : null),
            is_active: $request->has('is_active') ? $request->boolean('is_active') : ($isUpdate ? $leaveType->is_active : true),
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
            requires_attachment: $data['requires_attachment'],
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
            'requires_attachment' => $this->requires_attachment,
            'is_active' => $this->is_active,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove code from updates (shouldn't change)
        unset($data['code']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
