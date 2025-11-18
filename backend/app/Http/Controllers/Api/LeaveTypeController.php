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
        $perpage = request('per_page', 10);
        $leaveType = $this->leaveTypeService->getAllPaginated($perpage);

        return response()->json([
            'status' => 'success',
            'data'  => LeaveTypeResource::collection($leaveType),
        ], 200);
    }

    /**
     * Store a newly created leave
     */
    public function store(LeaveTypeRequest $request): JsonResponse
    {
        $dto = LeaveTypeDTO::fromRequest($request);
        $leaveType = $this->leaveTypeService->create($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Leave type created successfully.',
            'data' => new LeaveTypeResource($leaveType),
        ], 201);
    }

    /**
     * Display the specified leave
     */
    public function show(LeaveType $leaveType): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new LeaveTypeResource($leaveType),
        ], 200);
    }

    /**
     * Update the specified leave
     */
    public function update(LeaveTypeRequest $request, LeaveType $leaveType): JsonResponse
    {
        $dto = LeaveTypeDTO::fromRequest($request);
        $UpdatedLeaveType = $this->leaveTypeService->update($leaveType, $dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Leave type updated successfully.',
            'data' => new LeaveTypeResource($UpdatedLeaveType),
        ], 200);
    }

    /**
     * Remove the specified leave
     */
    public function destroy(LeaveType $leaveType): JsonResponse
    {
        $this->leaveTypeService->delete($leaveType);

        return response()->json([
            'status' => 'success',
            'message' => 'Leave type deleted successfully.'
        ], 200);
    }
}
