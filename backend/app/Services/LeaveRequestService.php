<?php

namespace App\Services;

use App\DataTransferObjects\LeaveRequestDTO;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use Illuminate\Support\Facades\Notification;
use App\Notifications\LeaveRequestCreated;
use Carbon\Carbon;
use Exception;

class LeaveRequestService
{
    public function __construct(
        protected LeaveRequestRepositoryInterface $repository
    ) {}

    /**
     * Create a leave request.
     * - Checks for overlapping requests
     * - Checks leave balance for paid leaves
     * - Stores attachment if provided
     * - Sends notification to manager
     *
     * @param LeaveRequestDTO $dto
     * @return LeaveRequest
     * @throws Exception
     */
    public function create(LeaveRequestDTO $dto): LeaveRequest
    {
        $employeeId = $dto->employee_id;

        // Calculate number of days
        $start = Carbon::parse($dto->start_date);
        $end   = Carbon::parse($dto->end_date);
        $days  = $start->diffInDays($end) + 1;

        // Check overlapping leave
        if ($this->repository->checkOverlap($employeeId, $start->toDateString(), $end->toDateString())) {
            throw new Exception("Employee already has a leave in this period.");
        }

        // Check leave balance if paid
        $leaveType = LeaveType::find($dto->leave_type_id);
        if ($leaveType->payment_type === 'paid') {
            $balance = LeaveBalance::where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveType->id)
                ->where('year', now()->year)
                ->first();

            if (!$balance || $balance->remaining_days < $days) {
                throw new Exception("Insufficient leave balance.");
            }
        }

        // Handle attachment upload
        $attachmentPath = null;
        if ($dto->attachment) {
            $attachmentPath = $dto->attachment->store('leave_attachments', 'public');
        }

        $data = [
            'employee_id'   => $employeeId,
            'leave_type_id' => $dto->leave_type_id,
            'start_date'    => $dto->start_date,
            'end_date'      => $dto->end_date,
            'days'          => $days,
            'reason'        => $dto->reason,
            'attachment'    => $attachmentPath,
            'status'        => 'pending',
        ];

        $leaveRequest = $this->repository->create($data);

        // Send notification to manager
        /* $manager = $leaveRequest->employee->manager;
        if ($manager) {
            Notification::send($manager, new LeaveRequestCreated($leaveRequest));
        } */

        return $leaveRequest;
    }

    /**
     * Manager approves a leave request.
     * - If leave requires HR approval (e.g. sick), status = manager_approved
     * - Otherwise, deduct balance and mark hr_approved directly
     *
     * @param int $id
     * @param int $managerId
     * @return LeaveRequest
     */
    public function managerApprove(int $id, int $managerId): LeaveRequest
    {




        $request = $this->repository->findById($id); // make sure with('employee.manager') loaded

        // Prevent employee from approving own leave
        if ($managerId === $request->employee->id) {
            throw new Exception("You cannot approve your own leave.");
        }

        // Check if the managerId is actually the manager of this employee
        if (!$request->employee->manager || $request->employee->manager->id !== $managerId) {
            throw new Exception("You are not authorized to approve this leave.");
        }
        if ($request->type->requires_hr_approval) {
            return $this->repository->updateStatus($request, [
                'status' => 'manager_approved',
                'manager_id' => $managerId,
                'manager_approved_at' => now(),
            ]);
        }

        // Otherwise, direct approval + balance deduction
        return $this->approveAndDeduct($request, 'manager', $managerId);
    }

    /**
     * HR approves a leave request.
     * Deducts leave balance for paid leaves
     *
     * @param int $id
     * @param int $hrId
     * @return LeaveRequest
     */
    public function hrApprove(int $id, int $hrId): LeaveRequest
    {
        $request = $this->repository->findById($id);
        return $this->approveAndDeduct($request, 'hr', $hrId);
    }

    /**
     * Private helper to approve leave and deduct balance
     *
     * @param LeaveRequest $request
     * @param string $role ('manager' or 'hr')
     * @param int $userId
     * @return LeaveRequest
     */
    private function approveAndDeduct(LeaveRequest $request, string $role, int $userId): LeaveRequest
    {
        if ($request->type->payment_type === 'paid') {
            $balance = LeaveBalance::where('employee_id', $request->employee_id)
                ->where('leave_type_id', $request->leave_type_id)
                ->where('year', now()->year)
                ->first();

            $balance->used_days += $request->days;
            $balance->remaining_days -= $request->days;
            $balance->save();
        }

        $data = [
            'status' => 'hr_approved',
            $role . '_id' => $userId,
            $role . '_approved_at' => now(),
        ];

        return $this->repository->updateStatus($request, $data);
    }

    /**
     * Get all leave requests for employees under a specific manager.
     * Optional filters: status (pending, approved, etc.), year
     *
     * @param int $managerId
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getLeavesForManager(int $managerId, array $filters = [])
    {
        // Call repository method to fetch leave requests under manager
        return $this->repository->getByManager($managerId, $filters);
    }
}