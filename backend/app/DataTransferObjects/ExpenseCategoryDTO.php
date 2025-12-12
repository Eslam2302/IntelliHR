<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ExpenseCategoryRequest;

class ExpenseCategoryDTO
{
    public function __construct(
        public readonly string $name,
    ) {}

    /**
     * Create DTO instance from validated request.
     */
    public static function fromRequest(ExpenseCategoryRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
        );
    }

    /**
     * Convert DTO into an array for mass assignment.
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}
