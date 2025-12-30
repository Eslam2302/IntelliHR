<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ExpenseCategoryRequest;

class ExpenseCategoryDTO
{
    public function __construct(
        public readonly ?string $name,
    ) {}

    /**
     * Create DTO instance from validated request.
     */
    public static function fromRequest(ExpenseCategoryRequest $request): self
    {
        $category = $request->route('category');
        $isUpdate = !empty($category);
        
        return new self(
            name: $isUpdate
                ? ($request->validated('name') ?? $category->name)
                : $request->validated('name'),
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
