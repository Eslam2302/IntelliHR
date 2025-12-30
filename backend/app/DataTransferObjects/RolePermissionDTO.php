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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Filter out empty arrays and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '' && (!is_array($value) || !empty($value));
        });
    }
}
