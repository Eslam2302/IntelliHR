<?php

use App\Http\Controllers\Api\AttendanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\JobPositionController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Models\JobPosition;

Route::get('home', [HomeController::class, 'index']);

Route::post('login', [AuthController::class, 'store']);



// (Protected Routes)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('logout', [AuthController::class, 'destroy']);

    // APIs

    Route::apiResource('departments', DepartmentController::class);
    Route::apiResource('employees', EmployeeController::class);

    Route::controller(AttendanceController::class)->prefix('attendance')->group(function () {
        Route::get('/', 'index');
        Route::post('check-in', 'checkIn');
        Route::post('check-out', 'checkOut');
        Route::get('{attendance}', 'show');
    });

    Route::apiResource('leave-types', LeaveTypeController::class);
    Route::apiResource('job-positions', JobPositionController::class);
    Route::apiResource('contracts', ContractController::class);
});
