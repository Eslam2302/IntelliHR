<?php

namespace App\Repositories\Contracts;

use App\Models\Competency;
use Illuminate\Pagination\LengthAwarePaginator;

interface CompetencyRepositoryInterface
{
    /**
     * Get all competencies with pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator;

    /**
     * Create a new competency
     */
    public function create(array $data): Competency;

    /**
     * Update existing competency
     */
    public function update(Competency $competency, array $data): Competency;

    /**
     * Delete existing competency
     */
    public function delete(Competency $competency): bool;
}

