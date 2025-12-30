<?php

namespace App\DataTransferObjects;

use App\Http\Requests\HiringStageRequest;

class HiringStageDTO
{
    public function __construct(
        public readonly ?int    $job_id,
        public readonly ?string $stage_name,
        public readonly ?int    $order,
    ) {}

    /**
     * Build DTO from validated request.
     *
     * @param HiringStageRequest $request
     * @return static
     */
    public static function fromRequest(HiringStageRequest $request): self
    {
        $hiringStage = $request->route('hiringStage');
        $isUpdate = !empty($hiringStage);
        
        return new self(
            job_id: $isUpdate
                ? ($request->validated('job_id') ?? $hiringStage->job_id)
                : $request->validated('job_id'),
            stage_name: $isUpdate
                ? ($request->validated('stage_name') ?? $hiringStage->stage_name)
                : $request->validated('stage_name'),
            order: $isUpdate
                ? ($request->validated('order') ?? $hiringStage->order)
                : $request->validated('order'),
        );
    }

    /**
     * Convert DTO to array for repository.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'job_id'     => $this->job_id,
            'stage_name' => $this->stage_name,
            'order'      => $this->order,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove job_id from updates (shouldn't change)
        unset($data['job_id']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
