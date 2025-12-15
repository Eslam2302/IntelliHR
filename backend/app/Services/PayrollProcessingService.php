<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Collection;
use App\Repositories\Contracts\PayrollRepositoryInterface;
use App\Repositories\Contracts\AllowanceRepositoryInterface;
use App\Repositories\Contracts\DeductionRepositoryInterface;
use App\Repositories\Contracts\EmployeeRepositoryInterface;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Models\Payroll;
use App\Repositories\Contracts\BenefitRepositoryInterface;
use Throwable;

class PayrollProcessingService
{

    protected string $lockKeyPrefix = 'payroll_process_lock_';
    protected int $lockTtl = 3600; // seconds
    public function __construct(
        protected PayrollRepositoryInterface $payrollRepository,
        protected AllowanceRepositoryInterface $allowanceRepository,
        protected DeductionRepositoryInterface $deductionRepository,
        protected EmployeeRepositoryInterface $employeeRepository,
        protected ContractRepositoryInterface $contractRepository,
        protected BenefitRepositoryInterface $benefitRepository,
        protected ActivityLoggerService $activityLogger
    ) {}

    /**
     *
     * Process payroll for a given year & month.
     * This method:
     * - Prevents double processing using cache lock
     * - Chunks active employees
     * - Fetches salary + monthly allowances/deductions
     * - Calculates net pay
     * - Marks allowances/deductions as processed
     *
     * @param int $year
     * @param int $month
     * @return void
     */
    public function processMonth(int $year, int $month): void
    {
        $lockKey = $this->lockKeyPrefix . "{$year}_{$month}";

        $lock = Cache::lock($lockKey, 3600);


        // -------------------------------------------
        // Prevent duplicate processing (Lock)
        // -------------------------------------------
        if (!$lock->get()) {
            throw new \Exception("Payroll for {$year}-{$month} already running");
        }

        try {

            $this->employeeRepository->chunkActiveEmployees(100, function ($employees) use ($year, $month) {

                foreach ($employees as $employee) {

                    DB::beginTransaction();

                    try {

                        // -------------------------------------------
                        // 1) Get Basic Salary from active contract
                        // -------------------------------------------
                        $basicSalary = $this->contractRepository->getBasicSalaryForActiveEmployee($employee->id);


                        // If no contract → skip employee
                        if ($basicSalary <= 0) {
                            DB::rollBack();
                            continue;
                        }

                        // -------------------------------------------
                        // 2) Get pending allowances & deductions & taxes & benefits (payroll_id = null)
                        // -------------------------------------------
                        $pendingAllowances = $this->allowanceRepository->getPendingForEmployeeMonth($employee->id);
                        $pendingDeductions = $this->deductionRepository->getPendingForEmployeeMonth($employee->id);



                        // -------------------------------------------
                        // 2.2) Add benefits
                        // -------------------------------------------
                        $benefits = $this->benefitRepository->getActiveForEmployeeMonth($employee->id);
                        foreach ($benefits as $benefit) {
                            if ($benefit->is_deduction) {
                                // Create a deduction record
                                $deduction = $this->deductionRepository->create([
                                    'employee_id' => $employee->id,
                                    'amount'      => $benefit->amount,
                                    'type' => $benefit->benefit_type,
                                    'payroll_id'  => null,
                                ]);

                                // Add to pending deductions to include in net pay calculation
                                $pendingDeductions->push($deduction);
                            } else {
                                // Create an allowance record
                                $allowance = $this->allowanceRepository->create([
                                    'employee_id' => $employee->id,
                                    'amount'      => $benefit->amount,
                                    'type' => $benefit->benefit_type,
                                    'payroll_id'  => null,
                                ]);

                                $pendingAllowances->push($allowance);
                            }
                        }

                        $totalAllowances = $pendingAllowances->sum('amount');
                        $totalDeductions = $pendingDeductions->sum('amount');

                        /**
                         * Calculate monthly tax based on annual salary
                         */
                        $annualIncome = ($basicSalary + $totalAllowances - $totalDeductions) * 12;
                        $tax = 0;

                        if ($annualIncome <= 40000.00) {
                            $tax = 0;
                        } elseif ($annualIncome > 40000.00 && $annualIncome <= 55000.00) {
                            $tax = ($basicSalary + $totalAllowances - $totalDeductions) * 0.10; // 10% monthly
                        } elseif ($annualIncome > 55000.00 && $annualIncome <= 70000.00) {
                            $tax = ($basicSalary + $totalAllowances - $totalDeductions) * 0.15; // 15% monthly
                        } else {
                            $tax = ($basicSalary + $totalAllowances - $totalDeductions) * 0.20; // 20% monthly
                        }

                        if ($tax > 0) {
                            $deduction = $this->deductionRepository->create([
                                'employee_id' => $employee->id,
                                'amount'      => $tax,
                                'type' => 'Income Tax',
                                'payroll_id'  => null,
                            ]);

                            $pendingDeductions->push($deduction);
                            $totalDeductions = $pendingDeductions->sum('amount');
                        }

                        // -------------------------------------------
                        // 3) Calculate Net Pay
                        // -------------------------------------------
                        $netPay = $basicSalary + $totalAllowances - $totalDeductions;

                        // -------------------------------------------
                        // 4) Create Payroll Record
                        // -------------------------------------------
                        $payroll = $this->payrollRepository->create([
                            'employee_id' => $employee->id,
                            'year'        => $year,
                            'month'       => $month,
                            'basic_salary' => $basicSalary,
                            'allowances'  => $totalAllowances,
                            'deductions'  => $totalDeductions,
                            'net_pay'     => $netPay,
                            'processed_at' => now(),
                        ]);

                        $this->activityLogger->log(
                            logName: 'payroll',
                            description: 'payroll_created',
                            subject: $payroll,
                            properties: [
                                'employee_id' => $employee->id,
                                'year'        => $year,
                                'month'       => $month,
                                'basic_salary' => $basicSalary,
                                'allowances'  => $totalAllowances,
                                'deductions'  => $totalDeductions,
                                'net_pay'     => $netPay,
                            ]
                        );

                        // -------------------------------------------
                        // 5) Mark allowances & deductions as processed
                        // -------------------------------------------
                        if ($pendingAllowances->isNotEmpty()) {
                            $this->allowanceRepository->markAsProcessed(
                                $pendingAllowances->pluck('id')->toArray(),
                                $payroll->id
                            );
                        }

                        $this->activityLogger->log(
                            logName: 'payroll',
                            description: 'allowances_processed',
                            subject: $payroll,
                            properties: [
                                'allowance_ids' => $pendingAllowances->pluck('id')->toArray(),
                            ]
                        );

                        if ($pendingDeductions->isNotEmpty()) {
                            $this->deductionRepository->markAsProcessed(
                                $pendingDeductions->pluck('id')->toArray(),
                                $payroll->id
                            );
                        }

                        $this->activityLogger->log(
                            logName: 'payroll',
                            description: 'deductions_processed',
                            subject: $payroll,
                            properties: [
                                'deduction_ids' => $pendingDeductions->pluck('id')->toArray(),
                            ]
                        );

                        DB::commit();
                    } catch (Throwable $e) {

                        DB::rollBack();
                        Log::error("Payroll error for employee {$employee->id}: " . $e->getMessage());

                        $this->activityLogger->log(
                            logName: 'payroll',
                            description: 'payroll_error',
                            subject: $employee,
                            properties: [
                                'employee_id' => $employee->id,
                                'message' => $e->getMessage()
                            ]
                        );
                    }
                } // end foreach

            }); // end chunk

        } finally {
            $lock->release();
        }
    }
}