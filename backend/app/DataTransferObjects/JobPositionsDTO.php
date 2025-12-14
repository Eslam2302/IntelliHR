<?php

namespace App\DataTransferObjects;

use App\Http\Requests\JobPositionRequest;

class JobPositionsDTO
{
    public function __construct(
        public readonly string $title,
        public readonly string $grade,
        public readonly string $department_id,
        public readonly float $min_salary,
        public readonly float $max_salary,
        public readonly ?string $responsibilities,
    ) {}

    /*
     * Create DTO from request
    */
    public static function fromRequest(JobPositionRequest $request): self
    {
        return new self(
            title: $request->validated('title'),
            grade: $request->validated('grade'),
            department_id: $request->validated('department_id'),
            min_salary: $request->validated('min_salary'),
            max_salary: $request->validated('max_salary'),
            responsibilities: $request->validated('responsibilities'),
        );
    }

    /**
     * Create DTO from array
     */
    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            grade: $data['grade'],
            department_id: $data['department_id'],
            min_salary: $data['min_salary'],
            max_salary: $data['max_salary'],
            responsibilities: $data['responsibilities'],
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'grade' => $this->grade,
            'department_id' => $this->department_id,
            'min_salary' => $this->min_salary,
            'max_salary' => $this->max_salary,
            'responsibilities' => $this->responsibilities
        ];
    }
}
