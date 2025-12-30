<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AssetRequest;

class AssetDTO
{
    public function __construct(
        public readonly ?string $name,
        public readonly ?string $serial_number,
        public readonly ?string $condition,
        public readonly ?string $status,
    ) {}

    /*
     * Create DTO from request
     */
    public static function fromRequest(AssetRequest $request): self
    {
        $asset = $request->route('asset');
        $isUpdate = !empty($asset);
        
        return new self(
            name: $isUpdate
                ? ($request->validated('name') ?? $asset->name)
                : $request->validated('name'),
            serial_number: $isUpdate
                ? ($request->validated('serial_number') ?? $asset->serial_number)
                : $request->validated('serial_number'),
            condition: $isUpdate
                ? ($request->validated('condition') ?? $asset->condition)
                : $request->validated('condition'),
            status: $isUpdate
                ? ($request->validated('status') ?? $asset->status)
                : $request->validated('status'),
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'serial_number' => $this->serial_number,
            'condition' => $this->condition,
            'status' => $this->status,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove serial_number from updates (shouldn't change)
        unset($data['serial_number']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}