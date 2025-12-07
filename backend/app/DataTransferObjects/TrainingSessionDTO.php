<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainingSessionRequest;

class TrainingSessionDTO
{
    public function __construct(
        public readonly string $title,
        public readonly string $start_date,
        public readonly string $end_date,
        public readonly int $trainer_id,
        public readonly int $department_id,
        public readonly ?string $description = null
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(TrainingSessionRequest $request): self
    {
        return new self(
            title: $request->validated('title'),
            start_date: $request->validated('start_date'),
            end_date: $request->validated('end_date'),
            trainer_id: $request->validated('trainer_id'),
            department_id: $request->validated('department_id'),
            description: $request->validated('description')
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'trainer_id' => $this->trainer_id,
            'department_id' => $this->department_id,
            'description' => $this->description,
        ];
    }
}
