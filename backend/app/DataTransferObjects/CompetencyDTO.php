<?php

namespace App\DataTransferObjects;

use App\Http\Requests\CompetencyRequest;

class CompetencyDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $description,
        public readonly string $category,
        public readonly string $applicableTo,
        public readonly array $ratingDescriptors,
        public readonly int $weight,
        public readonly ?bool $isActive,
        public readonly ?int $displayOrder,
    ) {}

    public static function fromRequest(CompetencyRequest $request): self
    {
        return new self(
            name: $request->validated('name') ?? '',
            description: $request->validated('description') ?? '',
            category: $request->validated('category') ?? '',
            applicableTo: $request->validated('applicable_to') ?? '',
            ratingDescriptors: $request->validated('rating_descriptors') ?? [],
            weight: $request->validated('weight') ?? 0,
            isActive: $request->has('is_active') ? $request->boolean('is_active') : null,
            displayOrder: $request->validated('display_order'),
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'category' => $this->category,
            'applicable_to' => $this->applicableTo,
            'rating_descriptors' => $this->ratingDescriptors,
            'weight' => $this->weight,
            'is_active' => $this->isActive,
            'display_order' => $this->displayOrder,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
    }
}
