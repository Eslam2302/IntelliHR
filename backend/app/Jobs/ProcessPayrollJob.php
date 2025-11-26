<?php

namespace App\Jobs;

use App\Services\PayrollProcessingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessPayrollJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $year;
    public int $month;

    public function __construct(int $year, int $month)
    {
        $this->year  = $year;
        $this->month = $month;
    }

    public function handle(PayrollProcessingService $payrollProcessingService)
    {
        try {
            $payrollProcessingService->processMonth($this->year, $this->month);
        } catch (Throwable $e) {
            Log::error("Payroll job failed: " . $e->getMessage());
            throw $e; // allows retrying
        }
    }
}