<?php

namespace App\Repositories\Contracts;

use App\Models\Contract;
use Illuminate\Pagination\LengthAwarePaginator;

interface ContractRepositoryInterface
{
    /**
     * Get all contracts with pagination
     */
    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator;

    /**
     * Create new contract position
     */
    public function create(array $data): Contract;

    /**
     * Update the existing contract
     */
    public function update(Contract $contract, array $data): Contract;

    /**
     * Delete contract
     */
    public function delete(Contract $contract): bool;
}
