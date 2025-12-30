<?php

namespace App\DataTransferObjects;

use App\Http\Requests\GoalRequest;

class GoalDTO
{
    public function __construct(
        public readonly int $employeeId,
        public readonly ?int $evaluationCycleId,
        public readonly int $setBy,
        public readonly string $title,
        public readonly string $description,
        public readonly string $type,
        public readonly string $category,
        public readonly array $successCriteria,
        public readonly string $startDate,
        public readonly string $targetDate,
        public readonly int $weight,
    ) {}

    public static function fromRequest(GoalRequest $request): self
    {
        $goal = $request->route('goal');
        $isUpdate = !empty($goal);
        
        // For create, employee_id is required (validation handles this)
        // For update, preserve existing value if not provided
        $employeeId = $isUpdate
            ? ($request->validated('employee_id') ?? $goal->employee_id)
            : $request->validated('employee_id');
        
        return new self(
            employeeId: $employeeId,
            evaluationCycleId: $request->validated('evaluation_cycle_id'),
            setBy: $request->user()->employee_id ?? 0,
            title: $request->validated('title') ?? '',
            description: $request->validated('description') ?? '',
            type: $request->validated('type') ?? '',
            category: $request->validated('category') ?? '',
            successCriteria: $request->validated('success_criteria') ?? [],
            startDate: $request->validated('start_date') ?? '',
            targetDate: $request->validated('target_date') ?? '',
            weight: $request->validated('weight') ?? 0,
        );
    }

    public function toArray(): array
    {
        return [
            'employee_id' => $this->employeeId,
            'evaluation_cycle_id' => $this->evaluationCycleId,
            'set_by' => $this->setBy,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'category' => $this->category,
            'success_criteria' => $this->successCriteria,
            'start_date' => $this->startDate,
            'target_date' => $this->targetDate,
            'weight' => $this->weight,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['employee_id'], $data['set_by']);
        // Filter out empty strings and null values for partial updates
        // But keep 0, false, and empty arrays as they are valid values
        $filtered = [];
        foreach ($data as $key => $value) {
            if ($value !== null && $value !== '') {
                $filtered[$key] = $value;
            } elseif ($value === 0 || $value === false || (is_array($value) && empty($value))) {
                // Allow 0, false, and empty arrays
                $filtered[$key] = $value;
            }
        }
        return $filtered;
    }
}
