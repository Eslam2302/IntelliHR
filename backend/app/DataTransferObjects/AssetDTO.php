<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AssetRequest;

class AssetDTO
{
    public function __construct(
        public readonly string $name,
        public readonly string $serial_number,
        public readonly string $condition,
        public readonly string $status,
    ) {}

    /*
     * Create DTO from request
     */
    public static function fromRequest(AssetRequest $request): self
    {
        return new self(
            name: $request->validated('name'),
            serial_number: $request->validated('serial_number'),
            condition: $request->validated('condition'),
            status: $request->validated('status'),
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
}