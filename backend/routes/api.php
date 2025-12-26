<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AllowanceController;
use App\Http\Controllers\Api\ApplicantController;
use App\Http\Controllers\Api\AssetAssignmentController;
use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BenefitController;
use App\Http\Controllers\Api\ContractController;
use App\Http\Controllers\Api\DeductionController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\EmployeeRoleController;
use App\Http\Controllers\Api\EmployeeTrainingController;
use App\Http\Controllers\Api\ExpenseCategoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\HiringStageController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\InterviewController;
use App\Http\Controllers\Api\JobPositionController;
use App\Http\Controllers\Api\JobPostController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\LeaveTypeController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PayrollPaymentController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\TrainingCertificateController;
use App\Http\Controllers\Api\TrainingEvaluationController;
use App\Http\Controllers\Api\TrainingSessionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('home', [HomeController::class, 'index']);

Route::post('login', [AuthController::class, 'store'])->middleware('throttle:5,1');

// (Protected Routes)
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('logout', [AuthController::class, 'destroy'])->middleware('throttle:10,1');

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

    // Payroll Routes
    Route::prefix('payrolls')->group(function () {

        // GET /api/payrolls → paginated list
        Route::get('/', [PayrollController::class, 'index'])->name('payrolls.index');

        // POST /api/payrolls → create new payroll
        Route::post('/', [PayrollController::class, 'store'])->name('payrolls.store');

        // GET /api/payrolls/{payroll} → show single payroll
        Route::get('/{payroll}', [PayrollController::class, 'show'])->name('payrolls.show');

        // PUT /api/payrolls/{payroll} → update payroll
        Route::put('/{payroll}', [PayrollController::class, 'update'])->name('payrolls.update');

        // DELETE /api/payrolls/{payroll} → delete payroll
        Route::delete('/{payroll}', [PayrollController::class, 'destroy'])->name('payrolls.destroy');

        // GET /api/payrolls/employee/{employeeId} → all payrolls for employee
        Route::get('/employee/{employeeId}', [PayrollController::class, 'employeePayrolls'])
            ->name('payrolls.employee');

        // GET /api/payrolls/month/{year}/{month} → all payrolls for a specific month
        Route::get('/month/{year}/{month}', [PayrollController::class, 'monthPayrolls'])
            ->name('payrolls.month');

        // POST /api/payrolls/process → process payroll for current month
        Route::post('/process', [PayrollController::class, 'processPayroll']);
    });

    Route::post('payrolls/{payroll}/pay', [PayrollPaymentController::class, 'processPayment']);

    // Trainer Routes
    Route::prefix('trainers')->group(function () {
        Route::get('/', [TrainerController::class, 'index']);        // GET all trainers
        Route::post('/', [TrainerController::class, 'store']);       // POST create trainer
        Route::get('/{trainer}', [TrainerController::class, 'show']); // GET trainer by id
        Route::put('/{trainer}', [TrainerController::class, 'update']); // PUT update trainer
        Route::delete('/{trainer}', [TrainerController::class, 'destroy']); // DELETE trainer
    });

    // Training Session Routes
    Route::prefix('training-sessions')->group(function () {
        Route::get('/', [TrainingSessionController::class, 'index']);          // List all sessions (paginated)
        Route::post('/', [TrainingSessionController::class, 'store']);         // Create a new session
        Route::get('{trainingSession}', [TrainingSessionController::class, 'show']);   // Show single session
        Route::put('{trainingSession}', [TrainingSessionController::class, 'update']); // Update session
        Route::delete('{trainingSession}', [TrainingSessionController::class, 'destroy']); // Delete session
    });

    // Employee Training Routes
    Route::prefix('employee-trainings')->group(function () {
        Route::get('/', [EmployeeTrainingController::class, 'index']);
        Route::post('/', [EmployeeTrainingController::class, 'store']);
        Route::get('{employeeTraining}', [EmployeeTrainingController::class, 'show']);
        Route::put('{employeeTraining}', [EmployeeTrainingController::class, 'update']);
        Route::delete('{employeeTraining}', [EmployeeTrainingController::class, 'destroy']);
    });

    // Training Certificates
    Route::prefix('training-certificates')->group(function () {
        Route::get('/', [TrainingCertificateController::class, 'index']);
        Route::post('/', [TrainingCertificateController::class, 'store']);
        Route::get('{certificate}', [TrainingCertificateController::class, 'show']);
        Route::put('{certificate}', [TrainingCertificateController::class, 'update']);
        Route::delete('{certificate}', [TrainingCertificateController::class, 'destroy']);
    });

    // Training Evaluation
    Route::prefix('training-evaluations')->group(function () {
        Route::get('/', [TrainingEvaluationController::class, 'index'])->name('training-evaluations.index');
        Route::post('/', [TrainingEvaluationController::class, 'store'])->name('training-evaluations.store');
        Route::get('/{evaluation}', [TrainingEvaluationController::class, 'show'])->name('training-evaluations.show');
        Route::put('/{evaluation}', [TrainingEvaluationController::class, 'update'])->name('training-evaluations.update');
        Route::delete('/{evaluation}', [TrainingEvaluationController::class, 'destroy'])->name('training-evaluations.destroy');
    });

    // Job post
    Route::prefix('job-posts')->group(function () {
        Route::get('/', [JobPostController::class, 'index']);
        Route::post('/', [JobPostController::class, 'store']);
        Route::get('/{jobPost}', [JobPostController::class, 'show']);
        Route::put('/{jobPost}', [JobPostController::class, 'update']);
        Route::delete('/{jobPost}', [JobPostController::class, 'destroy']);
    });

    // Hiring Stages
    Route::prefix('hiring-stages')->group(function () {
        Route::get('/', [HiringStageController::class, 'index']);
        Route::post('/', [HiringStageController::class, 'store']);
        Route::get('/{hiringStage}', [HiringStageController::class, 'show']);
        Route::put('/{hiringStage}', [HiringStageController::class, 'update']);
        Route::delete('/{hiringStage}', [HiringStageController::class, 'destroy']);
    });
    Route::get('job-posts/{jobPostId}/hiring-stages', [HiringStageController::class, 'getByJobPost']);

    // Applicant
    Route::prefix('applicants')->group(function () {
        Route::get('/', [ApplicantController::class, 'index']);
        Route::post('/', [ApplicantController::class, 'store']);
        Route::get('/{applicant}', [ApplicantController::class, 'show']);
        Route::put('/{applicant}', [ApplicantController::class, 'update']);
        Route::delete('/{applicant}', [ApplicantController::class, 'destroy']);
    });
    Route::get('job-posts/{jobPostId}/applicants', [ApplicantController::class, 'getByJobPost']);

    // Interview
    Route::prefix('interviews')->group(function () {
        Route::get('/', [InterviewController::class, 'index']);
        Route::post('/', [InterviewController::class, 'store']);
        Route::get('/{interview}', [InterviewController::class, 'show']);
        Route::put('/{interview}', [InterviewController::class, 'update']);
        Route::delete('/{interview}', [InterviewController::class, 'destroy']);
    });

    // Asset
    Route::prefix('assets')->group(function () {
        Route::get('/', [AssetController::class, 'index']);
        Route::post('/', [AssetController::class, 'store']);
        Route::get('/{asset}', [AssetController::class, 'show']);
        Route::put('/{asset}', [AssetController::class, 'update']);
        Route::delete('/{asset}', [AssetController::class, 'destroy']);
    });

    // Asset Assignments
    Route::prefix('asset-assignments')->group(function () {
        Route::get('/', [AssetAssignmentController::class, 'index']);
        Route::post('/', [AssetAssignmentController::class, 'store']);
        Route::get('/{asset_assignment}', [AssetAssignmentController::class, 'show']);
        Route::put('/{asset_assignment}', [AssetAssignmentController::class, 'update']);
        Route::delete('/{asset_assignment}', [AssetAssignmentController::class, 'destroy']);
    });

    // Expense Categories Routes
    Route::prefix('expense-categories')->group(function () {
        Route::get('/', [ExpenseCategoryController::class, 'index']);
        Route::post('/', [ExpenseCategoryController::class, 'store']);
        Route::get('{category}', [ExpenseCategoryController::class, 'show']);
        Route::put('{category}', [ExpenseCategoryController::class, 'update']);
        Route::delete('{category}', [ExpenseCategoryController::class, 'destroy']);
    });

    // Expenses Routes
    Route::prefix('expenses')->group(function () {
        Route::get('/', [ExpenseController::class, 'index']);
        Route::post('/', [ExpenseController::class, 'store']);
        Route::get('{expense}', [ExpenseController::class, 'show']);
        Route::put('{expense}', [ExpenseController::class, 'update']);
        Route::delete('{expense}', [ExpenseController::class, 'destroy']);
    });
    Route::get('employees/{employee}/expenses', [ExpenseController::class, 'employeeExpenses']);

    // Roles And Permissions
    Route::prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('{role}', [RoleController::class, 'show']);
        Route::put('{role}', [RoleController::class, 'update']);
        Route::delete('{role}', [RoleController::class, 'destroy']);
    });

    Route::prefix('role-permissions')->group(function () {
        Route::get('{role}', [PermissionController::class, 'index']);
        Route::post('{role}/sync', [PermissionController::class, 'sync']);
    });

    Route::prefix('employees')->group(function () {
        Route::post('{employee}/assign-role', [EmployeeRoleController::class, 'assign']);
    });

    Route::get('/activity-log', [ActivityLogController::class, 'index']);
});
