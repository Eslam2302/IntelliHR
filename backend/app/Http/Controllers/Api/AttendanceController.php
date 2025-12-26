<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AttendanceDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;

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
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search']);
        $attendances = $this->service->getAll($filters);

        return response()->json([
            'status' => 'success',
            'data' => AttendanceResource::collection($attendances),
            'meta' => [
                'current_page' => $attendances->currentPage(),
                'per_page' => $attendances->perPage(),
                'total' => $attendances->total(),
                'last_page' => $attendances->lastPage(),
            ],
        ]);
    }

    public function checkIn(StoreAttendanceRequest $request): JsonResponse
    {
        $attendance = $this->service->checkIn(AttendanceDTO::fromCheckInRequest($request, Auth::user()->employee_id));

        return response()->json([
            'status' => 'success',
            'message' => 'Checked in successfully',
            'data' => new AttendanceResource($attendance),
        ]);
    }

    public function checkOut(UpdateAttendanceRequest $request): JsonResponse
    {
        $attendance = $this->service->checkOut(AttendanceDTO::fromCheckOutRequest($request, Auth::user()->employee_id, now()));

        return response()->json([
            'status' => 'success',
            'message' => 'Checked out successfully',
            'data' => new AttendanceResource($attendance),
        ]);
    }

    public function show($attendanceId): JsonResponse
    {
        $attendance = Attendance::findOrFail($attendanceId);

        return response()->json([
            'status' => 'success',
            'data' => new AttendanceResource($attendance),
        ]);
    }
}
