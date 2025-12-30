<?php

namespace App\Http\Controllers\Api;

use App\DataTransferObjects\AttendanceDTO;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class AttendanceController extends Controller implements HasMiddleware
{
    public function __construct(protected AttendanceService $service) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            // All employees can check-in/check-out (no permission required)
            // Only HR/Admin can view all, create, update, delete attendances
            new Middleware('permission:view-all-attendances', only: ['index']),
            new Middleware('permission:create-attendance', only: ['store']),
            new Middleware('permission:edit-attendance', only: ['update']),
            new Middleware('permission:delete-attendance', only: ['destroy']),
        ];
    }

    public function index(Request $request): JsonResponse
    {
        $filters = request()->only(['per_page', 'page', 'sort', 'direction', 'search', 'employee_id', 'date', 'status']);
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

    public function store(AttendanceRequest $request): JsonResponse
    {
        $attendance = $this->service->create(AttendanceDTO::fromRequest($request));

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance created successfully',
            'data' => new AttendanceResource($attendance),
        ], 201);
    }

    public function show(Attendance $attendance): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => new AttendanceResource($attendance->load('employee')),
        ]);
    }

    public function update(AttendanceRequest $request, Attendance $attendance): JsonResponse
    {
        $updated = $this->service->update($attendance, AttendanceDTO::fromRequest($request));

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance updated successfully',
            'data' => new AttendanceResource($updated),
        ]);
    }

    public function destroy(Attendance $attendance): JsonResponse
    {
        $this->service->delete($attendance);

        return response()->json([
            'status' => 'success',
            'message' => 'Attendance deleted successfully',
        ]);
    }

    public function checkIn(AttendanceRequest $request): JsonResponse
    {
        $employeeId = $request->user()->employee_id ?? 0;
        
        // Create DTO for check-in with minimal required data
        $dto = new AttendanceDTO(
            employeeId: $employeeId,
            date: $request->validated('date') ?? now()->toDateString(),
            checkIn: $request->validated('check_in') ? Carbon::parse($request->validated('check_in')) : now(),
            location: $request->validated('location'),
            checkInIp: $request->validated('check_in_ip') ?? $request->ip(),
            notes: $request->validated('notes'),
            status: $request->validated('status') ?? 'present',
        );
        
        $attendance = $this->service->checkIn($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Checked in successfully',
            'data' => new AttendanceResource($attendance),
        ]);
    }

    public function checkOut(AttendanceRequest $request): JsonResponse
    {
        $employeeId = $request->user()->employee_id ?? 0;
        $date = $request->validated('date') ?? now()->toDateString();
        
        // Find today's attendance for check-out using service
        $todayAttendance = $this->service->findByEmployeeAndDate($employeeId, $date);
            
        if (!$todayAttendance) {
            return response()->json([
                'status' => 'error',
                'message' => 'You must check in first.',
            ], 404);
        }
        
        // Create DTO for check-out
        $dto = new AttendanceDTO(
            employeeId: $employeeId,
            date: $date,
            checkIn: $todayAttendance->check_in,
            checkOut: $request->validated('check_out') ? Carbon::parse($request->validated('check_out')) : now(),
            location: $request->validated('location'),
            checkOutIp: $request->validated('check_out_ip') ?? $request->ip(),
            notes: $request->validated('notes'),
            breakDurationMinutes: $request->validated('break_duration_minutes'),
        );
        
        $attendance = $this->service->checkOut($dto);

        return response()->json([
            'status' => 'success',
            'message' => 'Checked out successfully',
            'data' => new AttendanceResource($attendance),
        ]);
    }
}
