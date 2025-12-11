<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AssetAssignmentRequest;

class AssetAssignmentDTO
{
    public function __construct(
        public readonly int $asset_id,
        public readonly int $employee_id,
        public readonly string $assigned_date,
        public readonly ?string $return_date,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(AssetAssignmentRequest $request): self
    {
        return new self(
            asset_id: $request->validated('asset_id'),
            employee_id: $request->validated('employee_id'),
            assigned_date: $request->validated('assigned_date'),
            return_date: $request->validated('return_date') ?? null,
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'asset_id' => $this->asset_id,
            'employee_id' => $this->employee_id,
            'assigned_date' => $this->assigned_date,
            'return_date' => $this->return_date,
        ];
    }
}