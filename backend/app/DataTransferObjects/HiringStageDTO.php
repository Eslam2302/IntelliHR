<?php

namespace App\DataTransferObjects;

use App\Http\Requests\HiringStageRequest;

class HiringStageDTO
{
    public function __construct(
        public readonly int    $job_id,
        public readonly string $stage_name,
        public readonly int    $order,
    ) {}

    /**
     * Build DTO from validated request.
     *
     * @param HiringStageRequest $request
     * @return static
     */
    public static function fromRequest(HiringStageRequest $request): self
    {
        return new self(
            job_id: $request->validated('job_id'),
            stage_name: $request->validated('stage_name'),
            order: $request->validated('order'),
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
}
