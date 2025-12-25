<?php

namespace App\Repositories;

use App\Models\Benefit;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class BenefitRepository implements BenefitRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Benefit $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['benefit_type', 'amount'],
            ['id', 'benefit_type', 'amount', 'created_at', 'updated_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
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
