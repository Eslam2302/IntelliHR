<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\PayrollProcessingService;


Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('employees:process-probation')
    ->everyMinute()
    ->withoutOverlapping();

// for manual
Artisan::command('payroll:process {year?} {month?}', function ($year = null, $month = null) {
    $year = $year ?? date('Y');
    $month = $month ?? date('m');

    /** @var PayrollProcessingService $service */
    $service = app(PayrollProcessingService::class);

    $service->processMonth($year, $month);

    $this->info("Payroll processed for {$year}-{$month}");
})->describe('Process payroll for a given year and month');

// cron job for server
Artisan::command('schedule:payroll', function () {
    Artisan::call('payroll:process');
    $this->info('Scheduled payroll executed.');
})->describe('Run payroll automatically for current month');
