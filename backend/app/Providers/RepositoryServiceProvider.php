<?php

namespace App\Providers;

use App\Repositories\AllowanceRepository;
use App\Repositories\AttendanceRepository;
use App\Repositories\BenefitRepository;
use App\Repositories\ContractRepository;
use App\Repositories\Contracts\AllowanceRepositoryInterface;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Contracts\DeductionRepositoryInterface;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\DocumentRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\JobPositionRepositoryInterface;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use App\Repositories\DeductionRepository;
use App\Repositories\DepartmentRepository;
use App\Repositories\DocumentRepository;
use App\Repositories\EmployeeRepository;
use App\Repositories\JobPositionRepository;
use App\Repositories\LeaveRequestRepository;
use App\Repositories\LeaveTypeRepository;
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
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
