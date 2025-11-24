<?php

use App\Http\Controllers\Api\AllowanceController;
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
use App\Http\Controllers\Api\BenefitController;
use App\Http\Controllers\Api\DeductionController;

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

    // Document Routes
    Route::prefix('documents')->group(function () {
        Route::get('/', [DocumentController::class, 'index']);            // All documents (paginated)
        Route::get('/{document}', [DocumentController::class, 'show']);         // Single document by ID
        Route::post('/', [DocumentController::class, 'store']);           // Create document
        Route::put('/{document}', [DocumentController::class, 'update']);       // Update document
        Route::delete('/{document}', [DocumentController::class, 'destroy']);  // Delete document
    });
    // Custom route: Get all documents for a specific employee
    Route::get('/employees/{employeeId}/documents', [DocumentController::class, 'getByEmployee']);

    /**
     * Payroll Core
     */

    // Benefit Routes
    Route::prefix('benefits')->group(function () {
        Route::get('/', [BenefitController::class, 'index']); // List all benefits
        Route::get('/employee/{employeeId}', [BenefitController::class, 'employeeBenefits']); // List employee benefits
        Route::post('/', [BenefitController::class, 'store']); // Create benefit
        Route::get('/{benefit}', [BenefitController::class, 'show']); // Show single benefit
        Route::put('/{benefit}', [BenefitController::class, 'update']); // Update benefit
        Route::delete('/{benefit}', [BenefitController::class, 'destroy']); // Delete benefit
    });

    // Allowance Routes
    Route::prefix('allowances')->group(function () {
        Route::get('/', [AllowanceController::class, 'index']); // List all allowances
        Route::get('/employee/{employeeId}', [AllowanceController::class, 'EmployeeAllowances']); // List employee allowances
        Route::get('/payroll/{payrollId}', [AllowanceController::class, 'PayrollAllowances']); // List payroll allowances
        Route::post('/', [AllowanceController::class, 'store']); // Create allowance
        Route::get('/{allowance}', [AllowanceController::class, 'show']); // Show single allowance
        Route::put('/{allowance}', [AllowanceController::class, 'update']); // Update allowance
        Route::delete('/{allowance}', [AllowanceController::class, 'destroy']); // Delete allowance
    });

    // Deduction Routes
    Route::prefix('deductions')->group(function () {
        Route::get('/', [DeductionController::class, 'index']); // List all deductions
        Route::get('/employee/{employeeId}', [DeductionController::class, 'EmployeeDeductions']); // List employee deductions
        Route::get('/payroll/{payrollId}', [DeductionController::class, 'PayrollDeductions']); // List payroll deductions
        Route::post('/', [DeductionController::class, 'store']); // Create deduction
        Route::get('/{deduction}', [DeductionController::class, 'show']); // Show single deduction
        Route::put('/{deduction}', [DeductionController::class, 'update']); // Update deduction
        Route::delete('/{deduction}', [DeductionController::class, 'destroy']); // Delete deduction
    });
});
