<?php

namespace App\Repositories\Contracts;

use App\Models\Interview;
use Illuminate\Pagination\LengthAwarePaginator;

interface InterviewRepositoryInterface
{
    public function getAllPaginated(int $perPage = 10): LengthAwarePaginator;
    public function show(int $interviewId): Interview;
    public function create(array $data): Interview;
    public function update(Interview $interview, array $data): Interview;
    public function delete(Interview $interview): bool;
}
