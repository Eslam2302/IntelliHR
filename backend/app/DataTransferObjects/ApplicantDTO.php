<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ApplicantRequest;

class ApplicantDTO
{
    public function __construct(
        public readonly ?int $job_id,
        public readonly ?string $first_name,
        public readonly ?string $last_name,
        public readonly ?string $email,
        public readonly ?string $phone,
        public readonly ?bool $is_employee,
        public readonly ?string $status,
        public readonly ?string $source,
        public readonly ?int $experience_years,
        public readonly ?int $current_stage_id,
        public readonly ?string $resume_path,
        public readonly ?string $applied_at
    ) {}

    public static function fromRequest(ApplicantRequest $request): self
    {
        $applicant = $request->route('applicant');
        $isUpdate = !empty($applicant);
        
        return new self(
            job_id: $isUpdate
                ? ($request->validated('job_id') ?? $applicant->job_id)
                : $request->validated('job_id'),
            first_name: $isUpdate
                ? ($request->validated('first_name') ?? $applicant->first_name)
                : $request->validated('first_name'),
            last_name: $isUpdate
                ? ($request->validated('last_name') ?? $applicant->last_name)
                : $request->validated('last_name'),
            email: $isUpdate
                ? ($request->validated('email') ?? $applicant->email)
                : $request->validated('email'),
            phone: $isUpdate
                ? ($request->validated('phone') ?? $applicant->phone)
                : $request->validated('phone'),
            is_employee: $request->has('is_employee') ? $request->boolean('is_employee') : ($isUpdate ? $applicant->is_employee : false),
            status: $isUpdate
                ? ($request->validated('status') ?? $applicant->status)
                : $request->validated('status'),
            source: $request->validated('source') ?? ($isUpdate ? $applicant->source : null),
            experience_years: $request->validated('experience_years') ?? ($isUpdate ? $applicant->experience_years : null),
            current_stage_id: $request->validated('current_stage_id') ?? ($isUpdate ? $applicant->current_stage_id : null),
            resume_path: $isUpdate
                ? ($request->validated('resume_path') ?? $applicant->resume_path)
                : $request->validated('resume_path'),
            applied_at: $request->validated('applied_at') ?? ($isUpdate ? ($applicant->applied_at ? $applicant->applied_at->toDateString() : null) : null)
        );
    }

    public function toArray(): array
    {
        return [
            'job_id' => $this->job_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'is_employee' => $this->is_employee,
            'status' => $this->status,
            'source' => $this->source,
            'experience_years' => $this->experience_years,
            'current_stage_id' => $this->current_stage_id,
            'resume_path' => $this->resume_path,
            'applied_at' => $this->applied_at,
        ];
    }

    public function toUpdateArray(): array
    {
        $data = $this->toArray();
        // Remove immutable fields from updates (shouldn't change)
        unset($data['job_id'], $data['applied_at']);
        // Filter out empty strings and null values for partial updates
        return array_filter($data, function ($value) {
            return $value !== null && $value !== '';
        });
    }
}