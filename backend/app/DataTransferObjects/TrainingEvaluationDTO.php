<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainingEvaluationRequest;

class TrainingEvaluationDTO
{
    public function __construct(
        public readonly int $employee_id,
        public readonly int $training_id,
        public readonly int $rating,
        public readonly ?string $feedback = null
    ) {}

    /**
     * Create DTO from Request
     */
    public static function fromRequest(TrainingEvaluationRequest $request): self
    {
        return new self(
            employee_id: $request->validated('employee_id'),
            training_id: $request->validated('training_id'),
            rating: $request->validated('rating'),
            feedback: $request->validated('feedback')
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'employee_id' => $this->employee_id,
            'training_id' => $this->training_id,
            'rating' => $this->rating,
            'feedback' => $this->feedback,
        ];
    }
}
