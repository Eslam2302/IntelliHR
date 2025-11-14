<?php

namespace App\DataTransferObjects;

use App\Http\Requests\LeaveTypeRequest;

class LeaveTypeDTO {
    public function __construct(
        public readonly string $name,
        public readonly ?string $description,
        public readonly int $max_days_per_year,
        public readonly bool $is_paid,
        public readonly bool $requires_proof,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(LeaveTypeRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            description: $request->validated('description') ?? null,
            max_days_per_year: $request->validated('max_days_per_year'),
            is_paid: $request->validated('is_paid'),
            requires_proof: $request->validated('requires_proof')
        );
    }

    /**
     * Create DTO from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            description: $data['description'] ?? null,
            max_days_per_year: $data['max_days_per_year'],
            is_paid: $data['is_paid'],
            requires_proof: $data['requires_proof']
        );
    }

     /**
     * Convert DTO to array 
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'max_days_per_year' => $this->max_days_per_year,
            'is_paid' => $this->is_paid,
            'requires_proof' => $this->requires_proof,
        ];
    }
}