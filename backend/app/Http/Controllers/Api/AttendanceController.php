<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAttendanceRequest;
use App\Http\Requests\UpdateAttendanceRequest;
use App\Http\Resources\AttendanceResource;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();

        // Scope in model that check if employee (show his attendance only)
        // if employee is manager and has many employee (show self&employee attendance )
        $query = Attendance::visibleToUser($user)->with('employee');

        // Search filtering with data from
        if ($request->has('date_from')) {
            $query->whereDate('check_in', '>=', $request->date_from);
        }

        // Search filtering with data to
        if ($request->has('date_to')) {
            $query->whereDate('check_in', '<=', $request->date_to);
        }

        $attendances = $query
            ->orderBy('check_in', 'desc')
            ->paginate(15);

        return AttendanceResource::collection($attendances);
    }


    public function checkIn(StoreAttendanceRequest $request)
    {
        $user = Auth::user();
        $employee_id = $user->employee_id;

        $today = Carbon::today();
        $existingAttendance = Attendance::where('employee_id', $employee_id)
            ->whereDate('check_in', $today)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'status' => 'error',
                'message' => 'You Already Logged In Today | Have A Nice Day'
            ], 400);
        }

        $checkIn = Carbon::now();
        $startTime = Carbon::createFromTime(10, 0, 0);
        $isLate = $checkIn->greaterThan($startTime);


        $attendance = Attendance::create([
            'employee_id' => $employee_id,
            'check_in' => $checkIn,
            'is_late' => $isLate,
        ]);

        return new AttendanceResource($attendance);
    }


    public function show(Attendance $attendance)
    {
        $user = Auth::user();

        // Check if this employee has access to see this record
        $allowed = Attendance::visibleToUser($user)->where('id', $attendance->id)->exists();

        if (!$allowed) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to view this attendance record.'
            ], 403);
        }

        // If employee has access then successfuly
        $attendance->load('employee');
        return new AttendanceResource($attendance);
    }


    public function checkOut(UpdateAttendanceRequest $request)
    {
        $user = Auth::user();
        $employee_id = $user->employee_id;
        $today = Carbon::today();

        $attendance = Attendance::where('employee_id', $employee_id)
            ->whereDate('check_in', $today)
            ->first();

        $checkIn = $attendance->check_in ?? Null;
        $checkOut = Carbon::now();
        $totalSeconds = $checkOut->diffInSeconds($checkIn);
        $totalSeconds = abs($totalSeconds);
        $calculatedHours = round($totalSeconds / 3600, 2);

        $existingAttendanceOut = Attendance::where('employee_id', $employee_id)
            ->whereDate('check_out', $today)
            ->first();

        if ($existingAttendanceOut) {
            return response()->json([
                'status'   => 'error',
                'message'   => 'You Already Logged Out Today | Have A Nice Break'
            ], 400);
        }

        if (!$checkIn) {
            return response()->json([
                'status'   => 'error',
                'message'   => 'You Must Login First',
                'data' => $checkIn
            ], 400);
        } else {
            $attendance->update([
                'check_out' => $checkOut,
                'calculated_hours'  => $calculatedHours
            ]);

            return response()->json([
                'status' => 'success',
                'message'   =>  'You Logged Out Successfully | Have A Nice Break',
                'data'  =>  new AttendanceResource($attendance)
            ], 200);
        }
    }
}
