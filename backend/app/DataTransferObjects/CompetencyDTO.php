<?php

namespace App\DataTransferObjects;

use App\Http\Requests\CompetencyRequest;

class CompetencyDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $description,
        public readonly ?string $category,
        public readonly ?string $applicableTo,
        public readonly ?array $ratingDescriptors,
        public readonly ?int $weight,
        public readonly ?bool $isActive,
        public readonly ?int $displayOrder,
    ) {}

    public static function fromRequest(CompetencyRequest $request): self
    {
        $competency = $request->route('competency');
        $isUpdate = !empty($competency);
        
        return new self(
            name: $isUpdate
                ? ($request->validated('name') ?? $competency->name)
                : ($request->validated('name') ?? ''),
            description: $isUpdate
                ? ($request->validated('description') ?? $competency->description)
                : ($request->validated('description') ?? ''),
            category: $isUpdate
                ? ($request->validated('category') ?? $competency->category)
                : ($request->validated('category') ?? ''),
            applicableTo: $isUpdate
                ? ($request->validated('applicable_to') ?? $competency->applicable_to)
                : ($request->validated('applicable_to') ?? ''),
            ratingDescriptors: $request->validated('rating_descriptors') ?? ($isUpdate ? $competency->rating_descriptors : []),
            weight: $request->validated('weight') ?? ($isUpdate ? $competency->weight : 0),
            isActive: $request->has('is_active') ? $request->boolean('is_active') : ($isUpdate ? $competency->is_active : null),
            displayOrder: $request->validated('display_order') ?? ($isUpdate ? $competency->display_order : null),
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
