<?php

namespace App\Providers;

use App\Repositories\Contracts\DepartmentRepositoryInterface;
use App\Repositories\DepartmentRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Bind Department Repository
        $this->app->bind(
            DepartmentRepositoryInterface::class,
            DepartmentRepository::class
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
