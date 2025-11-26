<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\PayrollProcessingService;

class ProcessPayroll extends Command
{
    // اسم الكومانند اللي هتشغله من CLI
    protected $signature = 'payroll:process';

    // الوصف
    protected $description = 'Process payroll for current month';

    protected PayrollProcessingService $payrollService;

    public function __construct(PayrollProcessingService $payrollService)
    {
        parent::__construct();
        $this->payrollService = $payrollService;
    }

    public function handle()
    {
        $year = date('Y');
        $month = date('m');

        $this->info("Starting payroll for {$year}-{$month}");

        $this->payrollService->processMonth((int)$year, (int)$month);

        $this->info("Payroll processed for {$year}-{$month}");
    }
}
