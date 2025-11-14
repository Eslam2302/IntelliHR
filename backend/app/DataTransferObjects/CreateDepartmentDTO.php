<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreDepartmentRequest;

class CreateDepartmentDTO
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description = null,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(StoreDepartmentRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            description: $request->validated('description'),
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
        ];
    }
}