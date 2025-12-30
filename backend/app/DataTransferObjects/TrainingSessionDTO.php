<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainingSessionRequest;

class TrainingSessionDTO
{
    public function __construct(
        public readonly ?string $title,
        public readonly ?string $start_date,
        public readonly ?string $end_date,
        public readonly ?int $trainer_id,
        public readonly ?int $department_id,
        public readonly ?string $description = null
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(TrainingSessionRequest $request): self
    {
        $trainingSession = $request->route('trainingSession');
        $isUpdate = !empty($trainingSession);
        
        return new self(
            title: $isUpdate
                ? ($request->validated('title') ?? $trainingSession->title)
                : $request->validated('title'),
            start_date: $isUpdate
                ? ($request->validated('start_date') ?? ($trainingSession->start_date ? $trainingSession->start_date->toDateString() : null))
                : $request->validated('start_date'),
            end_date: $isUpdate
                ? ($request->validated('end_date') ?? ($trainingSession->end_date ? $trainingSession->end_date->toDateString() : null))
                : $request->validated('end_date'),
            trainer_id: $isUpdate
                ? ($request->validated('trainer_id') ?? $trainingSession->trainer_id)
                : $request->validated('trainer_id'),
            department_id: $isUpdate
                ? ($request->validated('department_id') ?? $trainingSession->department_id)
                : $request->validated('department_id'),
            description: $request->validated('description') ?? ($isUpdate ? $trainingSession->description : null)
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
