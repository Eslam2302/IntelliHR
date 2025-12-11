<?php

namespace App\DataTransferObjects;

use App\Http\Requests\InterviewRequest;

class InterviewDTO
{
    public function __construct(
        public readonly int $applicant_id,
        public readonly ?int $interviewer_id,
        public readonly string $scheduled_at,
        public readonly ?int $score,
        public readonly ?string $notes,
        public readonly string $status
    ) {}

    /**
     * Build DTO from validated request.
     *
     * @param InterviewRequest $request
     * @return static
     */
    public static function fromRequest(InterviewRequest $request): self
    {
        return new self(
            applicant_id: $request->validated('applicant_id'),
            interviewer_id: $request->validated('interviewer_id'),
            scheduled_at: $request->validated('scheduled_at'),
            score: $request->validated('score'),
            notes: $request->validated('notes'),
            status: $request->validated('status'),
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
}
