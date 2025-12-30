<?php

namespace App\DataTransferObjects;

use App\Http\Requests\InterviewRequest;

class InterviewDTO
{
    public function __construct(
        public readonly ?int $applicant_id,
        public readonly ?int $interviewer_id,
        public readonly ?string $scheduled_at,
        public readonly ?int $score,
        public readonly ?string $notes,
        public readonly ?string $status
    ) {}

    /**
     * Build DTO from validated request.
     *
     * @param InterviewRequest $request
     * @return static
     */
    public static function fromRequest(InterviewRequest $request): self
    {
        $interview = $request->route('interview');
        $isUpdate = !empty($interview);
        
        return new self(
            applicant_id: $isUpdate
                ? ($request->validated('applicant_id') ?? $interview->applicant_id)
                : $request->validated('applicant_id'),
            interviewer_id: $request->validated('interviewer_id') ?? ($isUpdate ? $interview->interviewer_id : null),
            scheduled_at: $isUpdate
                ? ($request->validated('scheduled_at') ?? ($interview->scheduled_at ? $interview->scheduled_at->toDateTimeString() : null))
                : $request->validated('scheduled_at'),
            score: $request->validated('score') ?? ($isUpdate ? $interview->score : null),
            notes: $request->validated('notes') ?? ($isUpdate ? $interview->notes : null),
            status: $isUpdate
                ? ($request->validated('status') ?? $interview->status)
                : $request->validated('status'),
        );
    }

    /**
     * Convert DTO to array.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'applicant_id' => $this->applicant_id,
            'interviewer_id' => $this->interviewer_id,
            'scheduled_at' => $this->scheduled_at,
            'score' => $this->score,
            'notes' => $this->notes,
            'status' => $this->status,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove applicant_id from updates (shouldn't change)
        unset($data['applicant_id']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
