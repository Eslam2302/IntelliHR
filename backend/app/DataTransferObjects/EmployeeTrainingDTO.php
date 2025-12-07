<?php

namespace App\DataTransferObjects;

use App\Http\Requests\EmployeeTrainingRequest;

class EmployeeTrainingDTO
{
    public function __construct(
        public int $employee_id,
        public int $training_id,
        public string $status,
        public ?string $completion_date = null
    ) {}

    /**
     * Create DTO from request.
     */
    public static function fromRequest(EmployeeTrainingRequest $request): self
    {
        return new self(
            employee_id: $request->employee_id,
            training_id: $request->training_id,
            status: $request->status,
            completion_date: $request->completion_date
        );
    }

    /**
     * Convert DTO to array for repository.
     */
    public function toArray(): array
    {
        return [
            'employee_id' => $this->employee_id,
            'training_id' => $this->training_id,
            'status' => $this->status,
            'completion_date' => $this->completion_date,
        ];
    }
}
