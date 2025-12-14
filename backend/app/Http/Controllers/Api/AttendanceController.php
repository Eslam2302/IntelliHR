<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AttendanceDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AttendanceController extends Controller implements HasMiddleware
{
    public function __construct(protected AttendanceService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:view-all-attendances', only: ['index']),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 15);
        $attendances = $this->service->getAllPaginatedForUser(Auth::user(), $perPage);
        return response()->json([
            'status' => 'success',
            'data' => AttendanceResource::collection($attendances),
        ]);
    }

    public function checkIn(StoreAttendanceRequest $request): JsonResponse
    {
        $attendance = $this->service->checkIn(AttendanceDTO::fromCheckInRequest($request, Auth::user()->employee_id));
        return response()->json([
            'status' => 'success',
            'message' => 'Checked in successfully',
            'data' => new AttendanceResource($attendance)
        ]);
    }

    public function checkOut(UpdateAttendanceRequest $request): JsonResponse
    {
        $attendance = $this->service->checkOut(AttendanceDTO::fromCheckOutRequest($request, Auth::user()->employee_id, now()));
        return response()->json([
            'status' => 'success',
            'message' => 'Checked out successfully',
            'data' => new AttendanceResource($attendance)
        ]);
    }

    public function show($attendanceId): JsonResponse
    {
        $attendance = $this->service->getAllPaginatedForUser(Auth::user())->firstWhere('id', $attendanceId);
        if (!$attendance) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized or record not found'
            ], 403);
        }
        return response()->json([
            'status' => 'success',
            'data' => new AttendanceResource($attendance)
        ]);
    }
}
