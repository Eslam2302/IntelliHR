<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainerRequest;

class TrainerDTO
{
    public function __construct(
        public readonly string $type,
        public readonly ?int $employee_id,
        public readonly ?string $name,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?string $company,
    ) {}

    /*
     * Create DTO from request
    */
    public static function fromRequest(TrainerRequest $request): self
    {
        return new self(
            type: $request->validated('type'),
            employee_id: $request->validated('employee_id') ?? null,
            name: $request->validated('name') ?? null,
            email: $request->validated('email') ?? null,
            phone: $request->validated('phone') ?? null,
            company: $request->validated('company') ?? null,
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'type' => $this->type,
            'employee_id' => $this->employee_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'company' => $this->company
        ];
    }
}
