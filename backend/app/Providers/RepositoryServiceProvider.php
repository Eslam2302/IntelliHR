<?php

namespace App\Providers;

use App\Repositories\AttendanceRepository;
use App\Repositories\Contracts\AttendanceRepositoryInterface;
use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\LeaveTypeRepositoryInterface;
use App\Repositories\DepartmentRepository;
use App\Repositories\EmployeeRepository;
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

        // Bind Department Repository
        $this->app->bind(
            DepartmentRepositoryInterface::class,
            DepartmentRepository::class
        );

        // Bind Leave Type Repository
        $this->app->bind(
            AttendanceRepositoryInterface::class,
            AttendanceRepository::class
        );

        // Bind Leave Type Repository
        $this->app->bind(
            LeaveTypeRepositoryInterface::class,
            LeaveTypeRepository::class
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
