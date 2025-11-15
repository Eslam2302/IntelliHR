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

    /*
     * Get all paginated leave type 10 per page
    */
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

            Log::info("Leave type created successfully", [
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

    /**
     * Update existing leave type
     */
    public function update(LeaveType $leaveType, LeaveTypeDTO $dto): LeaveType
    {
        try {
            DB::beginTransaction();

            $UpdatedLeaveType = $this->repository->update($leaveType, $dto->toArray());

            DB::commit();

            Log::info("Leave type Updated successfully", [
                'id' => $leaveType->id,
                'name' => $leaveType->name
            ]);

            return $UpdatedLeaveType;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error updating leave type {$leaveType->id}: " . $e->getMessage(), [
                'data' => $dto->toArray()
            ]);
            throw $e;
        }
    }

    /**
     * Delete existing leave type
     */
    public function delete(LeaveType $leaveType): bool
    {
        try {
            DB::beginTransaction();

            $deleted = $this->repository->delete($leaveType);

            DB::commit();

            Log::info("Leave type deleted successfully", [
                'id' => $leaveType->id,
                'name' => $leaveType->name
            ]);

            return $deleted;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Error deleting leave type {$leaveType->id}: " . $e->getMessage());
            throw $e;
        }
    }
}
