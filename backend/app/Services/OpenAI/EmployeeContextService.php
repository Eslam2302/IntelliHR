<?php

namespace App\Services\OpenAI;

use App\Models\Employee;
use App\Repositories\Contracts\LeaveBalanceRepositoryInterface;
use App\Repositories\Contracts\LeaveRequestRepositoryInterface;
use App\Repositories\Contracts\PayrollRepositoryInterface;
use Carbon\Carbon;

class EmployeeContextService
{
    public function __construct(
        protected LeaveBalanceRepositoryInterface $leaveBalanceRepository,
        protected LeaveRequestRepositoryInterface $leaveRequestRepository,
        protected PayrollRepositoryInterface $payrollRepository
    ) {}

    /**
     * Gather employee context data for chat assistant
     *
     * @param Employee $employee
     * @return array
     */
    public function getContext(Employee $employee): array
    {
        $context = [
            'employee' => [
                'id' => $employee->id,
                'name' => $employee->first_name . ' ' . $employee->last_name,
                'email' => $employee->personal_email,
                'department' => $employee->department?->name,
                'job_title' => $employee->job?->title,
                'employee_status' => $employee->employee_status,
                'hire_date' => $this->formatDate($employee->hire_date, 'Y-m-d'),
            ],
        ];

        // Get leave balance
        $leaveBalances = $this->leaveBalanceRepository->getByEmployeeAndYear(
            $employee->id,
            now()->year
        );

        $context['leave_balance'] = $leaveBalances->map(function ($balance) {
            return [
                'leave_type' => $balance->leaveType->name,
                'total' => $balance->total_entitlement,
                'used' => $balance->used_days,
                'remaining' => $balance->remaining_days,
            ];
        })->toArray();

        // Get recent leave requests
        $recentLeaves = $this->leaveRequestRepository->getByEmployee($employee->id, [
            'year' => now()->year,
        ]);

        $context['recent_leave_requests'] = $recentLeaves->take(5)->map(function ($leave) {
            return [
                'type' => $leave->type->name,
                'start_date' => $leave->start_date,
                'end_date' => $leave->end_date,
                'days' => $leave->days,
                'status' => $leave->status,
            ];
        })->toArray();

        // Get recent attendance (last 7 days)
        $recentAttendance = $employee->attendances()
            ->where('date', '>=', Carbon::now()->subDays(7))
            ->orderBy('date', 'desc')
            ->get();

        $context['recent_attendance'] = $recentAttendance->map(function ($attendance) {
            return [
                'date' => $this->formatDate($attendance->date, 'Y-m-d'),
                'check_in' => $this->formatDate($attendance->check_in, 'H:i'),
                'check_out' => $this->formatDate($attendance->check_out, 'H:i'),
                'status' => $attendance->status,
            ];
        })->toArray();

        // Get recent payrolls (last 6 months)
        $recentPayrolls = $this->payrollRepository->getByEmployee($employee->id)
            ->take(6)
            ->map(function ($payroll) {
                return [
                    'year' => $payroll->year,
                    'month' => $payroll->month,
                    'basic_salary' => $payroll->basic_salary,
                    'allowances' => $payroll->allowances,
                    'deductions' => $payroll->deductions,
                    'net_pay' => $payroll->net_pay,
                    'payment_status' => $payroll->payment_status,
                    'processed_at' => $this->formatDate($payroll->processed_at, 'Y-m-d'),
                ];
            })->toArray();

        $context['recent_payrolls'] = $recentPayrolls;

        // Get current month payroll if available
        $currentMonthPayroll = $this->payrollRepository->getByMonth(now()->year, now()->month)
            ->where('employee_id', $employee->id)
            ->first();

        if ($currentMonthPayroll) {
            $context['current_payroll'] = [
                'year' => $currentMonthPayroll->year,
                'month' => $currentMonthPayroll->month,
                'basic_salary' => $currentMonthPayroll->basic_salary,
                'allowances' => $currentMonthPayroll->allowances,
                'deductions' => $currentMonthPayroll->deductions,
                'net_pay' => $currentMonthPayroll->net_pay,
                'payment_status' => $currentMonthPayroll->payment_status,
            ];
        }

        return $context;
    }

    /**
     * Format context as string for OpenAI prompt
     *
     * @param array $context
     * @return string
     */
    public function formatContextForPrompt(array $context): string
    {
        $text = "Employee Information:\n";
        $text .= "Name: {$context['employee']['name']}\n";
        $text .= "Department: {$context['employee']['department']}\n";
        $text .= "Job Title: {$context['employee']['job_title']}\n";
        $text .= "Status: {$context['employee']['employee_status']}\n\n";

        if (!empty($context['leave_balance'])) {
            $text .= "Leave Balance:\n";
            foreach ($context['leave_balance'] as $balance) {
                $text .= "- {$balance['leave_type']}: {$balance['remaining']} days remaining (Used: {$balance['used']}/{$balance['total']})\n";
            }
            $text .= "\n";
        }

        if (!empty($context['recent_leave_requests'])) {
            $text .= "Recent Leave Requests:\n";
            foreach ($context['recent_leave_requests'] as $leave) {
                $text .= "- {$leave['type']}: {$leave['start_date']} to {$leave['end_date']} ({$leave['days']} days) - Status: {$leave['status']}\n";
            }
            $text .= "\n";
        }

        if (!empty($context['recent_attendance'])) {
            $text .= "Recent Attendance (Last 7 days):\n";
            foreach ($context['recent_attendance'] as $attendance) {
                $text .= "- {$attendance['date']}: {$attendance['status']}";
                if ($attendance['check_in']) {
                    $text .= " (Checked in: {$attendance['check_in']}";
                    if ($attendance['check_out']) {
                        $text .= ", Checked out: {$attendance['check_out']}";
                    }
                    $text .= ")";
                }
                $text .= "\n";
            }
            $text .= "\n";
        }

        if (!empty($context['current_payroll'])) {
            $payroll = $context['current_payroll'];
            $text .= "Current Month Payroll ({$payroll['month']}/{$payroll['year']}):\n";
            $text .= "- Basic Salary: $" . number_format($payroll['basic_salary'], 2) . "\n";
            $text .= "- Allowances: $" . number_format($payroll['allowances'], 2) . "\n";
            $text .= "- Deductions: $" . number_format($payroll['deductions'], 2) . "\n";
            $text .= "- Net Pay: $" . number_format($payroll['net_pay'], 2) . "\n";
            $text .= "- Payment Status: {$payroll['payment_status']}\n\n";
        }

        if (!empty($context['recent_payrolls'])) {
            $text .= "Recent Payroll History (Last 6 months):\n";
            foreach ($context['recent_payrolls'] as $payroll) {
                $text .= "- {$payroll['month']}/{$payroll['year']}: Net Pay $" . number_format($payroll['net_pay'], 2) . " (Status: {$payroll['payment_status']})\n";
            }
        }

        return $text;
    }

    /**
     * Safely format a date value
     *
     * @param mixed $date
     * @param string $format
     * @return string|null
     */
    protected function formatDate($date, string $format): ?string
    {
        if (!$date) {
            return null;
        }

        if (is_string($date)) {
            try {
                return Carbon::parse($date)->format($format);
            } catch (\Exception $e) {
                return $date; // Return as-is if parsing fails
            }
        }

        if (method_exists($date, 'format')) {
            return $date->format($format);
        }

        return (string) $date;
    }
}

