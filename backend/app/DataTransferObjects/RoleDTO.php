<?php

namespace App\DataTransferObjects;

use App\Http\Requests\RoleRequest;

class RoleDTO
{
    public function __construct(
        public readonly string $name,
        public readonly ?array $permissions,
    ) {}

    public static function fromRequest(RoleRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            permissions: $request->validated('permissions') ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}