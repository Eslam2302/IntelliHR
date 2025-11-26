<?php

namespace App\Repositories;

use App\Models\Benefit;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BenefitRepository implements BenefitRepositoryInterface
{

    public function __construct(
        protected Benefit $model
    ) {}
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perpage);
    }

    public function showEmployeeBenefits(int $employeeId, int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->where('employee_id', $employeeId)
            ->latest()
            ->paginate($perpage);
    }

    public function create(array $data): Benefit
    {
        return $this->model->create($data);
    }

    public function update(Benefit $benefit, array $data): Benefit
    {
        $benefit->update($data);
        return $benefit->fresh();
    }

    public function delete(Benefit $benefit): bool
    {
        return $benefit->delete();
    }

    public function getActiveForEmployeeMonth(int $employeeId): Collection
    {

        return $this->model
            ->where('employee_id', $employeeId)
            ->where(function ($q) {
                $q->whereNull('end_date');
            })->get();
    }
}
