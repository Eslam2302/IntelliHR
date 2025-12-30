<?php

namespace App\DataTransferObjects;

use App\Http\Requests\JobPostRequest;

class JobPostDTO
{
    public function __construct(
        public readonly ?string  $title,
        public readonly ?string  $description,
        public readonly ?string $requirements,
        public readonly ?string $responsibilities,
        public readonly ?int     $department_id,
        public readonly ?string  $job_type,
        public readonly ?string  $status,
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
        $jobPost = $request->route('jobPost');
        $isUpdate = !empty($jobPost);
        
        return new self(
            title: $isUpdate
                ? ($request->validated('title') ?? $jobPost->title)
                : $request->validated('title'),
            description: $isUpdate
                ? ($request->validated('description') ?? $jobPost->description)
                : $request->validated('description'),
            requirements: $request->validated('requirements') ?? ($isUpdate ? $jobPost->requirements : null),
            responsibilities: $request->validated('responsibilities') ?? ($isUpdate ? $jobPost->responsibilities : null),
            department_id: $isUpdate
                ? ($request->validated('department_id') ?? $jobPost->department_id)
                : $request->validated('department_id'),
            job_type: $isUpdate
                ? ($request->validated('job_type') ?? $jobPost->job_type)
                : $request->validated('job_type'),
            status: $isUpdate
                ? ($request->validated('status') ?? $jobPost->status)
                : $request->validated('status'),
            posted_at: $request->validated('posted_at') ?? ($isUpdate && $jobPost->posted_at ? $jobPost->posted_at->toDateString() : null),
            linkedin_job_id: $request->validated('linkedin_job_id') ?? ($isUpdate ? $jobPost->linkedin_job_id : null),
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

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove posted_at from updates (shouldn't change)
        unset($data['posted_at']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}
