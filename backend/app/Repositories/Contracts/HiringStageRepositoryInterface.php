<?php

namespace App\Repositories\Contracts;

use App\Models\HiringStage;
use Illuminate\Pagination\LengthAwarePaginator;

interface HiringStageRepositoryInterface
{
    public function getAll(array $filters = []): LengthAwarePaginator;

    public function show(int $hiringStageId): HiringStage;

    public function getByJobPost(int $jobPostId);

    public function create(array $data): HiringStage;

    public function update(HiringStage $hiringStage, array $data): HiringStage;

    public function delete(HiringStage $hiringStage): bool;
}
