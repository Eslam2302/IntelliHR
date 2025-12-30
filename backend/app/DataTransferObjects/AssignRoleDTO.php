<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AssignRoleRequest;

class AssignRoleDTO
{
    public function __construct(
        public readonly string $role
    ) {}

    public static function fromRequest(AssignRoleRequest $request): self
    {
        return new self(
            role: $request->validated('role')
        );
    }

     public function toArray(): array
    {
        return [
            'role' => $this->role,
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
