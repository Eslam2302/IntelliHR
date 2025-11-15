<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\LeaveTypeDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveTypeRequest;
use App\Http\Resources\LeaveTypeResource;
use App\Models\LeaveType;
use App\Services\LeaveTypeService;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Http\JsonResponse;



class LeaveTypeController extends Controller implements HasMiddleware
{

    public function __construct(
        protected LeaveTypeService $leaveTypeService
    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:create-leave-type|Super Admin', only: ['store']),
            new Middleware('permission:edit-leave-type|Super Admin', only: ['update']),
            new Middleware('permission:delete-leave-type|Super Admin', only: ['destroy']),
        ];
    }

    /**
     * Display a listing of leave type
     */
    public function index(): JsonResponse
    {
        try {
            $perpage = request('per_page', 10);
            $leaveType = $this->leaveTypeService->getAllPaginated($perpage);

            return response()->json([
                'status' => 'success',
                'data'  => LeaveTypeResource::collection($leaveType),
                'meta' => [
                    'current_page' => $leaveType->currentPage(),
                    'per_page' => $leaveType->perPage(),
                    'total' => $leaveType->total(),
                    'last_page' => $leaveType->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch leave types.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Store a newly created leave
     */
    public function store(LeaveTypeRequest $request): JsonResponse
    {
        try {
            $dto = LeaveTypeDTO::fromRequest($request);
            $leaveType = $this->leaveTypeService->create($dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Leave type created successfully.',
                'data' => new LeaveTypeResource($leaveType),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to create leave type.',
                'data' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Display the specified leave
     */
    public function show(LeaveType $leaveType): JsonResponse
    {
        try {
            return response()->json([
                'status' => 'success',
                'data' => new LeaveTypeResource($leaveType),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch leave type.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Update the specified leave
     */
    public function update(LeaveTypeRequest $request, LeaveType $leaveType): JsonResponse
    {
        try {
            $dto = LeaveTypeDTO::fromRequest($request);
            $UpdatedLeaveType = $this->leaveTypeService->update($leaveType, $dto);

            return response()->json([
                'status' => 'success',
                'message' => 'Leave type updated successfully.',
                'data' => new LeaveTypeResource($UpdatedLeaveType),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update leave type.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Remove the specified leave
     */
    public function destroy(LeaveType $leaveType): JsonResponse
    {
        try {
            $this->leaveTypeService->delete($leaveType);

            return response()->json([
                'status' => 'success',
                'message' => 'Leave type deleted successfully.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete leave type.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }
}
