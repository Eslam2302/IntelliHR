<?php

namespace App\Services;

use App\DataTransferObjects\LeaveTypeDTO;
use App\Models\LeaveType;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LeaveTypeService
{
    public function __construct(
        protected LeaveTypeRepositoryInterface $repository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /*
     * Get all leave types with optional filters
    */
    public function getAll(array $filters = [])
    {
        try {
            return $this->repository->getAll($filters);
        } catch (Exception $e) {
            Log::error('Error fetching leave types: '.$e->getMessage());
            throw $e;
        }
    }

    /**
     * Create a new leave type
     */
    public function create(LeaveTypeDTO $dto): LeaveType
    {
        try {

            $leaveType = $this->repository->create($dto->toArray());

            $this->activityLogger->log(
                logName: 'leaveType',
                description: 'leave_type_created',
                subject: $leaveType,
                properties: [
                    'name' => $leaveType->name,
                    'code' => $leaveType->code,
                    'annual_entitlement' => $leaveType->annual_entitlement,
                ]
            );

            Log::info('Leave type created successfully', [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
            ]);

            return $leaveType;
        } catch (Exception $e) {
            Log::error('Error creating LeaveType: '.$e->getMessage(), ['data' => $dto->toArray()]);
            throw $e;
        }
    }

    /**
     * Update existing leave type
     */
    public function update(LeaveType $leaveType, LeaveTypeDTO $dto): LeaveType
    {
        try {

            $oldData = $leaveType->only([
                'name',
                'code',
                'annual_entitlement',
                'carry_over_limit',
                'min_request_days',
                'max_request_days',
                'requires_hr_approval',
                'is_active',
                'payment_type',
                'requires_attachment',
            ]);

            $UpdatedLeaveType = $this->repository->update($leaveType, $dto->toArray());

            $this->activityLogger->log(
                logName: 'leaveType',
                description: 'leave_type_updated',
                subject: $UpdatedLeaveType,
                properties: [
                    'before' => $oldData,
                    'after' => $UpdatedLeaveType->only([
                        'name',
                        'code',
                        'annual_entitlement',
                        'accrual_policy',
                        'carry_over_limit',
                        'min_request_days',
                        'max_request_days',
                        'requires_hr_approval',
                        'is_active',
                        'payment_type',
                        'requires_attachment',
                    ]),
                ]
            );

            Log::info('Leave type Updated successfully', [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
            ]);

            return $UpdatedLeaveType;
        } catch (Exception $e) {
            Log::error("Error updating leave type {$leaveType->id}: ".$e->getMessage(), [
                'data' => $dto->toArray(),
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

            $data = $leaveType->only([
                'name',
                'code',
                'annual_entitlement',
                'min_request_days',
                'max_request_days',
                'requires_hr_approval',
                'is_active',
            ]);

            $deleted = $this->repository->delete($leaveType);

            $this->activityLogger->log(
                logName: 'leaveType',
                description: 'leave_type_deleted',
                subject: $leaveType,
                properties: $data
            );

            Log::info('Leave type deleted successfully', [
                'id' => $leaveType->id,
                'name' => $leaveType->name,
            ]);

            return $deleted;
        } catch (Exception $e) {
            DB::rollBack();
            Log::error("Error deleting leave type {$leaveType->id}: ".$e->getMessage());
            throw $e;
        }
    }
}
