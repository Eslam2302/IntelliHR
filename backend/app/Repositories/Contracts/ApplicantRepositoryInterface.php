<?php

namespace App\Repositories\Contracts;

use App\Models\Applicant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ApplicantRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;

    public function show(int $applicantId): Applicant;

    public function create(array $data): Applicant;

    public function update(Applicant $applicant, array $data): Applicant;
    
    public function delete(Applicant $applicant): bool;

    /**
     * Get all applicants for a specific job post.
     *
     * @param int $jobPostId
     * @return Collection
     */
    public function getByJobPost(int $jobPostId): Collection;
}
