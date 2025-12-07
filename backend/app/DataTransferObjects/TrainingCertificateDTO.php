<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainingCertificateRequest;

class TrainingCertificateDTO
{
    /**
     * Constructor for DTO.
     */
    public function __construct(
        public readonly int $employee_training_id,
        public readonly ?string $issued_at,
        public readonly string $certificate_path
    ) {}

    /**
     * Create DTO from a request.
     */
    public static function fromRequest(TrainingCertificateRequest $request): self
    {
        return new self(
            employee_training_id: $request->validated('employee_training_id'),
            issued_at: $request->validated('issued_at'),
            certificate_path: $request->validated('certificate_path')
        );
    }

    /**
     * Convert DTO to array.
     */
    public function toArray(): array
    {
        return [
            'employee_training_id' => $this->employee_training_id,
            'issued_at' => $this->issued_at,
            'certificate_path' => $this->certificate_path,
        ];
    }
}
