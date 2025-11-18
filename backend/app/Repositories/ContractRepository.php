<?php

namespace App\Repositories;

use App\Models\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

class ContractRepository implements ContractRepositoryInterface
{
    public function __construct(
        protected Contract $model
    ){}

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
}
