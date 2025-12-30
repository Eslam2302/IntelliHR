<?php

namespace App\DataTransferObjects;

use App\Http\Requests\RoleRequest;

class RoleDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?array $permissions,
    ) {}

    public static function fromRequest(RoleRequest $request): self
    {
        $role = $request->route('role');
        $isUpdate = !empty($role);
        
        return new self(
            name: $isUpdate
                ? ($request->validated('name') ?? $role->name)
                : $request->validated('name'),
            permissions: $request->validated('permissions') ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}