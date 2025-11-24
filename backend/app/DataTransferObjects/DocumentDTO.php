<?php

namespace App\DataTransferObjects;

use Illuminate\Http\Request;
use App\Http\Requests\DocumentRequest;
use Illuminate\Support\Facades\Log;

class DocumentDTO
{
    public function __construct(
        public readonly ?int $employee_id,
        public readonly ?string $doc_type,
        public readonly ?object $attachment, // UploadedFile
    ) {}

    /**
     * Create DTO from request
     */
    public static function fromRequest(DocumentRequest $request): self
    {
        return new self(
            employee_id: $request->input('employee_id'),
            doc_type: $request->input('doc_type'),
            attachment: $request->file('attachment'),
        );

    }

    /**
     * Convert DTO to array (only includes non-null values)
     */
    public function toArray(): array
    {
        $data = [];

        if ($this->employee_id !== null) {
            $data['employee_id'] = $this->employee_id;
        }

        if ($this->doc_type !== null) {
            $data['doc_type'] = $this->doc_type;
        }

        if ($this->attachment !== null) {
            $data['attachment'] = $this->attachment;
        }

        return $data;
    }
}