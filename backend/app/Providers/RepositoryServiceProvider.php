<?php

namespace App\Providers;

use App\Repositories\AllowanceRepository;
use App\Repositories\ApplicantRepository;
use App\Repositories\AssetAssignmentRepository;
use App\Repositories\AssetRepository;
use App\Repositories\AttendanceRepository;
use App\Repositories\BenefitRepository;
use App\Repositories\ContractRepository;
use App\Repositories\Contracts\AllowanceRepositoryInterface;
use App\Repositories\Contracts\ApplicantRepositoryInterface;
use App\Repositories\Contracts\AssetAssignmentRepositoryInterface;
use App\Repositories\Contracts\AssetRepositoryInterface;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Contracts\DeductionRepositoryInterface;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\EmployeeRoleRepositoryInterface;
use App\Repositories\Contracts\EmployeeTrainingRepositoryInterface;
use App\Repositories\Contracts\ExpenseCategoryRepositoryInterface;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Contracts\HiringStageRepositoryInterface;
use App\Repositories\Contracts\InterviewRepositoryInterface;
use App\Repositories\Contracts\JobPositionRepositoryInterface;
use App\Repositories\Contracts\JobPostRepositoryInterface;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use App\Repositories\Contracts\PayrollRepositoryInterface;
use App\Repositories\Contracts\RolePermissionRepositoryInterface;
use App\Repositories\Contracts\RoleRepositoryInterface;
use App\Repositories\Contracts\TrainerRepositoryInterface;
use App\Repositories\Contracts\TrainingCertificateRepositoryInterface;
use App\Repositories\Contracts\TrainingEvaluationRepositoryInterface;
use App\Repositories\Contracts\TrainingSessionRepositoryInterface;
use App\Repositories\DeductionRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\DocumentRepository;
use App\Repositories\EmployeeRepository;
use App\Repositories\EmployeeRoleRepository;
use App\Repositories\EmployeeTrainingRepository;
use App\Repositories\ExpenseCategoryRepository;
use App\Repositories\ExpenseRepository;
use App\Repositories\HiringStageRepository;
use App\Repositories\InterviewRepository;
use App\Repositories\JobPositionRepository;
use App\Repositories\JobPostRepository;
use App\Repositories\LeaveRequestRepository;
use App\Repositories\LeaveTypeRepository;
use App\Repositories\PayrollRepository;
use App\Repositories\RolePermissionRepository;
use App\Repositories\RoleRepository;
use App\Repositories\TrainerRepository;
use App\Repositories\TrainingCertificateRepository;
use App\Repositories\TrainingEvaluationRepository;
use App\Repositories\TrainingSessionRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind Employee Repository
        $this->app->bind(
            EmployeeRepositoryInterface::class,
            EmployeeRepository::class
        );

        // Bind Contract Repository
        $this->app->bind(
            ContractRepositoryInterface::class,
            ContractRepository::class
        );

        // Bind Department Repository
        $this->app->bind(
            DepartmentRepositoryInterface::class,
            DepartmentRepository::class
        );

        // Bind Job Position Repository
        $this->app->bind(
            JobPositionRepositoryInterface::class,
            JobPositionRepository::class
        );

        // Bind Attendance Repository
        $this->app->bind(
            AttendanceRepositoryInterface::class,
            AttendanceRepository::class
        );

        // Bind Leave Type Repository
        $this->app->bind(
            LeaveTypeRepositoryInterface::class,
            LeaveTypeRepository::class
        );

        // Bind Leave Request Repository
        $this->app->bind(
            LeaveRequestRepositoryInterface::class,
            LeaveRequestRepository::class
        );

        // Bind document Repository
        $this->app->bind(
            DocumentRepositoryInterface::class,
            DocumentRepository::class
        );

        // Bind Benefit Repository
        $this->app->bind(
            BenefitRepositoryInterface::class,
            BenefitRepository::class
        );

        // Bind Allowance Repository
        $this->app->bind(
            AllowanceRepositoryInterface::class,
            AllowanceRepository::class
        );

        // Bind Deduction Repository
        $this->app->bind(
            DeductionRepositoryInterface::class,
            DeductionRepository::class
        );

        // Bind Payroll Repository
        $this->app->bind(
            PayrollRepositoryInterface::class,
            PayrollRepository::class
        );

        // Bind Trainer Repository
        $this->app->bind(
            TrainerRepositoryInterface::class,
            TrainerRepository::class
        );

        // Bind TrainingSession Repository
        $this->app->bind(
            TrainingSessionRepositoryInterface::class,
            TrainingSessionRepository::class
        );

        // bind Employee Training Repository
        $this->app->bind(
            EmployeeTrainingRepositoryInterface::class,
            EmployeeTrainingRepository::class
        );

        // bind Training Certificate Repository
        $this->app->bind(
            TrainingCertificateRepositoryInterface::class,
            TrainingCertificateRepository::class
        );

        // bind Training Evaluation Repository
        $this->app->bind(
            TrainingEvaluationRepositoryInterface::class,
            TrainingEvaluationRepository::class
        );

        // bind Job post Repository
        $this->app->bind(
            JobPostRepositoryInterface::class,
            JobPostRepository::class
        );

        // bind Hiring stages Repository
        $this->app->bind(
            HiringStageRepositoryInterface::class,
            HiringStageRepository::class
        );

        // bind Applicant Repository
        $this->app->bind(
            ApplicantRepositoryInterface::class,
            ApplicantRepository::class
        );

        // bind Interview Repository
        $this->app->bind(
            InterviewRepositoryInterface::class,
            InterviewRepository::class
        );

        // bind Asset Repository
        $this->app->bind(
            AssetRepositoryInterface::class,
            AssetRepository::class
        );

        // bind Asset assignment Repository
        $this->app->bind(
            AssetAssignmentRepositoryInterface::class,
            AssetAssignmentRepository::class
        );

        // bind Expense Category Repository
        $this->app->bind(
            ExpenseCategoryRepositoryInterface::class,
            ExpenseCategoryRepository::class
        );

        // bind Expense Repository
        $this->app->bind(
            ExpenseRepositoryInterface::class,
            ExpenseRepository::class
        );

        // bind Role Repository
        $this->app->bind(
            RoleRepositoryInterface::class,
            RoleRepository::class
        );

        // bind Role permission Repository
        $this->app->bind(
            RolePermissionRepositoryInterface::class,
            RolePermissionRepository::class
        );

        // bind Employee Role Repository
        $this->app->bind(
            EmployeeRoleRepositoryInterface::class,
            EmployeeRoleRepository::class
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}