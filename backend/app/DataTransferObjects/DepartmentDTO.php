<?php

namespace App\DataTransferObjects;

use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;

class DepartmentDTO
{
    public function __construct(
        public readonly string $name,
        public readonly ?string $description = null,
    ) {}

    /**
     * Create DTO from store request
     */
    public static function fromStoreRequest(StoreDepartmentRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            description: $request->validated('description'),
        );
    }

     /**
     * Create DTO from store request
     */
    public static function fromUpdateRequest(UpdateDepartmentRequest $request): self
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
