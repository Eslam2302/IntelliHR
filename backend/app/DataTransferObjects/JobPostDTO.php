<?php

namespace App\DataTransferObjects;

use App\Http\Requests\JobPostRequest;

class JobPostDTO
{
    public function __construct(
        public readonly string  $title,
        public readonly string  $description,
        public readonly ?string $requirements,
        public readonly ?string $responsibilities,
        public readonly int     $department_id,
        public readonly string  $job_type,
        public readonly string  $status,
        public readonly ?string $posted_at,
        public readonly ?string $linkedin_job_id,
    ) {}

    /**
     * Build DTO from validated data.
     *
     * @param array<string, mixed> $data
     * @return static
     */
    public static function fromRequest(JobPostRequest $request): self
    {
        return new self(
            title: $request->validated('title'),
            description: $request->validated('description'),
            requirements: $request->validated('requirements') ?? null,
            responsibilities: $request->validated('responsibilities') ?? null,
            department_id: $request->validated('department_id'),
            job_type: $request->validated('job_type'),
            status: $request->validated('status'),
            posted_at: $request->validated('posted_at') ?? null,
            linkedin_job_id: $request->validated('linkedin_job_id') ?? null,
        );
    }

    /**
     * Convert DTO to array
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'requirements'  => $this->requirements,
            'responsibilities' => $this->responsibilities,
            'department_id' => $this->department_id,
            'job_type' => $this->job_type,
            'status' => $this->status,
            'posted_at' => $this->posted_at,
            'linkedin_job_id' => $this->linkedin_job_id
        ];
    }
}
