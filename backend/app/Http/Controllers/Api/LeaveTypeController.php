<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeaveTypeRequest;
use App\Http\Resources\LeaveTypeResource;
use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;


class LeaveTypeController extends Controller implements HasMiddleware
{

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:create-leave-type|Super Admin', only: ['store']),
            new Middleware('permission:edit-leave-type|Super Admin', only: ['update']),
            new Middleware('permission:delete-leave-type|Super Admin', only: ['destroy']),
        ];
    }

    public function index()
    {
        $leaveType = LeaveType::latest()->paginate(10);

        return response()->json([
            'status' => 'success',
            'data' => LeaveTypeResource::collection($leaveType),
        ], 200);
    }

    public function store(LeaveTypeRequest $request)
    {
        $leaveType = LeaveType::create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Leave type created successfully',
            'data' => new LeaveTypeResource($leaveType)
        ], 201);
    }

    public function show(LeaveType $leaveType)
    {
        return new LeaveTypeResource($leaveType);
    }

    public function update(LeaveTypeRequest $request, LeaveType $leaveType)
    {
        $leaveType->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Leave type updated successfully',
            'data' => new LeaveTypeResource($request)
        ], 200);
    }

    public function destroy(LeaveType $leaveType)
    {
        $leaveTypeName = $leaveType->name;
        $leaveType->delete();

        return response()->json([
            'status' => 'success',
            'message' => $leaveTypeName . ' Deleted successfully'
        ], 200);
    }
}
