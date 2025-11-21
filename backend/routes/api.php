<?php

use App\Http\Controllers\Api\AttendanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\JobPositionController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\LeaveRequestController;

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

    Route::prefix('leave-requests')->group(function () {

        // Create leave request
        Route::post('/', [LeaveRequestController::class, 'store']);

        // Manager approval
        // {id} = leave request id, {managerId} = manager user id
        Route::post(
            '{id}/manager-approve',
            [LeaveRequestController::class, 'managerApprove']
        )->middleware('auth:sanctum');

        // HR approval
        // {id} = leave request id, {hrId} = HR user id
        Route::post('{id}/hr-approve/{hrId}', [LeaveRequestController::class, 'hrApprove']);

        // Manager Dashboard: view all leave requests of team
        Route::get('/manager-dashboard/{managerId}', [LeaveRequestController::class, 'managerDashboard']);
    });

    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);            // All documents (paginated)
        Route::get('/{id}', [DocumentController::class, 'show']);         // Single document by ID
        Route::post('/', [DocumentController::class, 'store']);           // Create document
        Route::put('/{id}', [DocumentController::class, 'update']);       // Update document
        Route::delete('/{id}', [DocumentController::class, 'destroy']);  // Delete document
    });

    // Custom route: Get all documents for a specific employee
    Route::get('/employees/{employeeId}/documents', [DocumentController::class, 'getByEmployee']);
});
