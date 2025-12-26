<?php

namespace App\Repositories;

use App\Models\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Traits\FilterQueryTrait;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractRepository implements ContractRepositoryInterface
{
    use FilterQueryTrait;

    public function __construct(
        protected Contract $model
    ) {}

    public function getAll(array $filters = []): LengthAwarePaginator
    {
        $query = $this->model->query();

        $query = $this->applyFilters(
            $query,
            $filters,
            ['contract_type'],
            ['id', 'employee_id', 'start_date', 'end_date', 'created_at', 'deleted_at'],
            'created_at',
            'desc'
        );

        return $query->paginate($this->getPaginationLimit($filters, 10));
    }

    public function create(array $data): Contract
    {
        return $this->model->create($data);
    }

    public function update(Contract $contract, array $data): Contract
    {
        $contract->update($data);

        return $contract->fresh();
    }

    public function delete(Contract $contract): bool
    {
        return $contract->delete();
    }

    /**
     * Return the basic salary for the given employee from the active contract(where end_date = Null).
     * If none found, return 0.
     */
    public function getBasicSalaryForActiveEmployee(int $employeeId): float
    {
        $contract = Contract::where('employee_id', $employeeId)
            ->whereNull('end_date')
            ->orderByDesc('start_date')
            ->first();

        return $contract ? (float) $contract->salary : 0;
    }
}
