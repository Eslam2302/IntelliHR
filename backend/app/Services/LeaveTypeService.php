<?php

namespace App\Services;

use App\DataTransferObjects\LeaveTypeDTO;
use App\Models\LeaveType;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveTypeService
{
    public function __construct(
        protected LeaveTypeRepositoryInterface $repository
    ) {}

    public function getAllPaginated(int $perpage = 10): LengthAwarePaginator
    {
        try {
            return $this->repository->getAllPaginated($perpage);
        } catch (\Exception $e) {
            Log::error('Error fetching leave types: ' . $e->getMessage());
            throw $e;
        };
    }

    /**
     * Create a new leave type
     */
    public function create(LeaveTypeDTO $dto): LeaveType
    {
        try {
            DB::beginTransaction();

            $leaveType = $this->repository->create($dto->toArray());

            DB::commit();

            Log::info("Department created successfully", [
                'id' => $leaveType->id,
                'name' => $leaveType->name
            ]);

            return $leaveType;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating LeaveType: ' . $e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    public function update(LeaveType $leaveType, LeaveType $dto): LeaveType
    {
        try {
            DB::beginTransaction();

            $UpdatedLeaveType = $this->repository->update($leaveType, $dto->toArray());

            DB::commit();

            Log::info("Department Updated successfully", [
                'id' => $leaveType->id,
                'name' => $leaveType->name
            ]);

            return $UpdatedLeaveType;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating department {$leaveType->id}: " . $e->getMessage(), [
                'data' => $dto->toArray()
            ]);
            throw $e;
        }
    }

    public function delete(LeaveType $leaveType): bool
    {
        try {
            DB::beginTransaction();

            $deleted = $this->repository->delete($leaveType);

            DB::commit();

            Log::info("Department deleted successfully", [
                'id' => $leaveType->id,
                'name' => $leaveType->name
            ]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting department {$leaveType->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
