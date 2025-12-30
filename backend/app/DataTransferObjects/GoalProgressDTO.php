<?php

namespace App\DataTransferObjects;

use App\Http\Requests\GoalProgressRequest;

class GoalProgressDTO
{
    public function __construct(
        public readonly int $updatedBy,
        public readonly string $updateNote,
        public readonly int $progressPercentage,
        public readonly string $status,
        public readonly ?string $updateDate,
    ) {}

    public static function fromRequest(GoalProgressRequest $request): self
    {
        return new self(
            updatedBy: $request->user()->employee_id ?? 0,
            updateNote: $request->validated('update_note') ?? '',
            progressPercentage: $request->validated('progress_percentage') ?? 0,
            status: $request->validated('status') ?? '',
            updateDate: $request->validated('update_date'),
        );
    }

    public function toArray(): array
    {
        return [
            'updated_by' => $this->updatedBy,
            'update_note' => $this->updateNote,
            'progress_percentage' => $this->progressPercentage,
            'status' => $this->status,
            'update_date' => $this->updateDate,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove updated_by from updates (shouldn't change)
        unset($data['updated_by']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function($value) {
            return $value !== null && $value !== '';
        });
    }
}
