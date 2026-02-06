<?php

namespace App\DataTransferObjects;

use App\Http\Requests\TrainingCertificateRequest;

class TrainingCertificateDTO
{
    /**
     * Constructor for DTO.
     */
    public function __construct(
        public readonly ?int $employee_training_id,
        public readonly ?string $issued_at,
        public readonly ?string $certificate_path
    ) {}

    /**
     * Create DTO from a request.
     */
    public static function fromRequest(TrainingCertificateRequest $request): self
    {
        $certificate = $request->route('certificate');
        $isUpdate = !empty($certificate);
        
        return new self(
            employee_training_id: $isUpdate
                ? ($request->validated('employee_training_id') ?? $certificate->employee_training_id)
                : $request->validated('employee_training_id'),
            issued_at: $request->validated('issued_at') ?? ($isUpdate && $certificate->issued_at ? $certificate->issued_at->toDateString() : null),
            certificate_path: $isUpdate
                ? ($request->validated('certificate_path') ?? $certificate->certificate_path)
                : $request->validated('certificate_path', null)
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove employee_training_id from updates (shouldn't change)
        unset($data['employee_training_id']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
