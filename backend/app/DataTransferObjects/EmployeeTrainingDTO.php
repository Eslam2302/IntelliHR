<?php

namespace App\DataTransferObjects;

use App\Http\Requests\EmployeeTrainingRequest;
use App\Models\EmployeeTraining;

class EmployeeTrainingDTO
{
    public function __construct(
        public ?int $employee_id,
        public ?int $training_id,
        public string $status,
        public ?string $completion_date = null
    ) {}

    /**
     * Create DTO from request (create or update).
     * On update, employee_id and training_id come from the existing model when not in request.
     */
    public static function fromRequest(EmployeeTrainingRequest $request): self
    {
        $existing = $request->route('employeeTraining');
        if ($existing instanceof EmployeeTraining) {
            return new self(
                employee_id: $request->input('employee_id') ?? $existing->employee_id,
                training_id: $request->input('training_id') ?? $existing->training_id,
                status: $request->input('status', $existing->status),
                completion_date: $request->input('completion_date') ?? $existing->completion_date
            );
        }

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
        return array_filter([
            'employee_id' => $this->employee_id,
            'training_id' => $this->training_id,
            'status' => $this->status,
            'completion_date' => $this->completion_date,
        ], fn ($v) => $v !== null);
    }

    public function toUpdateArray(): array
    {
        $data = [
            'status' => $this->status,
            'completion_date' => $this->completion_date,
        ];
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
