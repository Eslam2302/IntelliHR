<?php

namespace App\Repositories;

use App\Models\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractRepository implements ContractRepositoryInterface
{
    public function __construct(
        protected Contract $model
    ) {}

    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        return $this->model
            ->latest()
            ->paginate($perpage);
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
     *
     * Return the basic salary for the given employee from the active contract(where end_date = Null).
     * If none found, return 0.
     *
     * @param int $employeeId
     * @return float
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