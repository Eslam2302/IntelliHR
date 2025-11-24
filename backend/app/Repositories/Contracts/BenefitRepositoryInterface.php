<?php

namespace App\Repositories\Contracts;

use App\Models\Benefit;
use Illuminate\Pagination\LengthAwarePaginator;

interface BenefitRepositoryInterface
{
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    public function showEmployeeBenefits(int $employeeId, int $perpage = 10): LengthAwarePaginator;

    public function create(array $data): Benefit;

    public function update(Benefit $benefit, array $data): Benefit;

    public function delete(Benefit $benefit): bool;
}
