<?php

namespace App\Repositories\Contracts;

use App\Models\Applicant;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface ApplicantRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function show(int $applicantId): Applicant;

    public function create(array $data): Applicant;

    public function update(Applicant $applicant, array $data): Applicant;

    public function delete(Applicant $applicant): bool;

    /**
     * Get all applicants for a specific job post.
     */
    public function getByJobPost(int $jobPostId): Collection;
}
