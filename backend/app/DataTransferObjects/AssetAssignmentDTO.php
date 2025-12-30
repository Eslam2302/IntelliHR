<?php

namespace App\DataTransferObjects;

use App\Http\Requests\AssetAssignmentRequest;

class AssetAssignmentDTO
{
    public function __construct(
        public readonly ?int $asset_id,
        public readonly ?int $employee_id,
        public readonly ?string $assigned_date,
        public readonly ?string $return_date,
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(AssetAssignmentRequest $request): self
    {
        $assignment = $request->route('asset_assignment');
        $isUpdate = !empty($assignment);
        
        return new self(
            asset_id: $isUpdate
                ? ($request->validated('asset_id') ?? $assignment->asset_id)
                : $request->validated('asset_id'),
            employee_id: $isUpdate
                ? ($request->validated('employee_id') ?? $assignment->employee_id)
                : $request->validated('employee_id'),
            assigned_date: $isUpdate
                ? ($request->validated('assigned_date') ?? ($assignment->assigned_date ? $assignment->assigned_date->toDateString() : null))
                : $request->validated('assigned_date'),
            return_date: $request->validated('return_date') ?? ($isUpdate && $assignment->return_date ? $assignment->return_date->toDateString() : null),
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['asset_id'], $data['employee_id'], $data['assigned_date']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}