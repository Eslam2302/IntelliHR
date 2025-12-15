<?php

namespace App\Services;

use App\DataTransferObjects\ContractDTO;
use App\Models\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use Exception;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;

class ContractService
{
    public function __construct(
        protected ContractRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (Exception $e) {
            Log::error('Error fetching Contracts: ' . $e->getMessage());
            throw $e;
        }
    }

    public function create(ContractDTO $dto): Contract
    {
        try {
            $contract = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'contract',
                description: 'contract_created',
                subject: $contract,
                properties: [
                    'employee_id' => $contract->employee_id,
                    'start_date' => $contract->start_date,
                    'contract_type' => $contract->contract_type,
                    'salary' => $contract->salary,
                ]
            );

            Log::info("Contract created successfully", [
                'id' => $contract->id,
                'employee_id' => $contract->employee_id,
                'start_date' => $contract->start_date,
                'contract_type' => $contract->contract_type,
                'salary' => $contract->salary,
            ]);
            return $contract;
        } catch (Exception $e) {
            Log::error('Error creating Contract: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(Contract $contract, ContractDTO $dto): Contract
    {
        try {
            $oldData = $contract;

            $updatedContract = $this->repository->update($contract, $dto->toArray());

            $this->activityLogger->log(
                logName: 'contract',
                description: 'contract_updated',
                subject: $updatedContract,
                properties: [
                    'before' => $oldData,
                    'after'  => $updatedContract
                        ->only([
                            'employee_id',
                            'start_date',
                            'contract_type',
                            'salary'
                        ]),
                ]
            );

            Log::info("Contract updated successfully", [
                'id' => $contract->id,
                'employee_id' => $contract->employee_id,
                'start_date' => $contract->start_date,
                'contract_type' => $contract->contract_type,
                'salary' => $contract->salary,
            ]);
            return $updatedContract;
        } catch (Exception $e) {
            Log::error('Error updating Contract: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function delete(Contract $contract): bool
    {
        try {
            $data = $contract->only([
                'employee_id',
                'start_date',
                'contract_type',
                'salary'
            ]);

            $deletedContract = $this->repository->delete($contract);

            $this->activityLogger->log(
                logName: 'contract',
                description: 'contract_deleted',
                subject: $contract,
                properties: $data
            );

            Log::info("Contract Deleted successfully", [
                'id' => $contract->id,
                'employee_id' => $contract->employee_id,
                'start_date' => $contract->start_date,
                'contract_type' => $contract->contract_type,
                'salary' => $contract->salary,
            ]);
            return $deletedContract;
        } catch (Exception $e) {
            Log::error('Error deleting Contract: ' . $e->getMessage());
            throw $e;
        }
    }
}