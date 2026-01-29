<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\LeaveRequest as LeaveRequestForm;
use App\Http\Resources\LeaveRequestResource;
use App\DataTransferObjects\LeaveRequestDTO;
use App\Services\LeaveRequestService;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class LeaveRequestController extends Controller implements HasMiddleware
{
    public function __construct(protected LeaveRequestService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:manager-approve-leave-request', only: ['managerApprove']),
            new Middleware('permission:hr-approve-leave-request', only: ['hrApprove']),
            new Middleware('permission:view-employees-leave-request', only: ['managerDashboard']),
        ];
    }

    /**
     * Create a new leave request.
     *
     * @param LeaveRequestForm $request
     * @return JsonResponse
     */
    public function store(LeaveRequestForm $request): JsonResponse
    {
        $dto = LeaveRequestDTO::fromRequest($request);

        $leaveRequest = $this->service->create($dto);

        return response()->json([
            'success' => true,
            'data' => new LeaveRequestResource($leaveRequest),
            'message' => 'Leave request created successfully.'
        ], 201);
    }

    /**
     * Manager approves a leave request.
     *
     * @param int $id
     * @param int $managerId
     * @return JsonResponse
     */
    public function managerApprove(int $id): JsonResponse
    {
        $managerId = Auth::id();

        try {
            $updatedRequest = $this->service->managerApprove($id, $managerId);
            return response()->json([
                'success' => true,
                'data' => new LeaveRequestResource($updatedRequest),
                'message' => 'Leave request approved by manager successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        }
    }

    /**
     * HR approves a leave request.
     *
     * @param int $id
     * @return JsonResponse
     */
    public function hrApprove(int $id): JsonResponse
    {
        // Use authenticated user's employee ID instead of URL parameter
        $hrId = Auth::user()->employee_id;
        
        if (!$hrId) {
            return response()->json([
                'success' => false,
                'message' => 'User must be associated with an employee.'
            ], 403);
        }

        $leaveRequest = $this->service->hrApprove($id, $hrId);

        return response()->json([
            'success' => true,
            'data' => new LeaveRequestResource($leaveRequest),
            'message' => 'Leave request approved by HR.'
        ]);
    }

    /**
     * Manager Dashboard
     * Returns all leave requests for employees under this manager
     *
     * GET /api/leave-requests/manager-dashboard/{managerId}
     *
     * Optional query parameters: status, year
     */
    public function managerDashboard(int $managerId)
    {
        // Verify that the authenticated user is the manager
        $authenticatedEmployeeId = Auth::user()->employee_id;
        
        if ($managerId !== $authenticatedEmployeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. You can only view your own team\'s leave requests.'
            ], 403);
        }

        $filters = [
            'status' => request()->query('status'),
            'year'   => request()->query('year'),
        ];

        // Fetch leave requests using Service
        $leaveRequests = $this->service->getLeavesForManager($managerId, $filters);

        return response()->json([
            'success' => true,
            'data'    => LeaveRequestResource::collection($leaveRequests),
            'message' => 'Leave requests under your team fetched successfully.'
        ]);
    }

    /**
     * My leave requests – list for logged-in user's employee. No permission required.
     * GET /api/leave-requests/my?status=...&year=...
     */
    public function myRequests(Request $request): JsonResponse
    {
        $employeeId = Auth::user()->employee_id ?? 0;
        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'User must be linked to an employee.',
            ], 403);
        }
        $filters = [
            'status' => $request->query('status'),
            'year'   => $request->query('year'),
        ];
        $leaveRequests = $this->service->getLeavesForEmployee($employeeId, $filters);
        return response()->json([
            'success' => true,
            'data'    => LeaveRequestResource::collection($leaveRequests),
        ]);
    }
}
