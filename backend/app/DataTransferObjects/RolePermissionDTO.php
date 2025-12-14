<?php

namespace App\DataTransferObjects;

use App\Http\Requests\RolePermissionRequest;

class RolePermissionDTO
{
    public function __construct(
        public readonly array $permissions
    ) {}

    public static function fromRequest(RolePermissionRequest $request): self
    {
        return new self(
            permissions: $request->validated('permissions')
        );
    }

    public function toArray(): array
    {
        return [
            'permissions' => $this->permissions,
        ];
    }
}
