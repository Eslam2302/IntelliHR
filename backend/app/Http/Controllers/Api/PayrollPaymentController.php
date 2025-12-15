<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Services\ActivityLoggerService;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class PayrollPaymentController extends Controller implements HasMiddleware
{
    public function __construct(
        protected StripePaymentService $stripeService,
        protected ActivityLoggerService $activityLogger

    ) {}

    public static function middleware(): array
    {
        return [
            new Middleware('auth:sanctum'),
            new Middleware('permission:create-payroll-payment', only: ['processPayment']),
        ];
    }

    public function processPayment(Request $request, Payroll $payroll): JsonResponse
    {
        $request->validate([
            'stripeToken' => 'required|string',
        ]);

        if ($payroll->payment_status === 'paid') {
            return response()->json([
                'status' => 'error',
                'message' => 'Payroll already paid.',
            ], 400);
        }

        DB::beginTransaction();
        try {
            $employee = $payroll->employee;

            $result = $this->stripeService->processPayrollPayment(
                $payroll->id,
                $payroll->net_pay,
                "{$employee->first_name} {$employee->last_name}",
                $payroll->month,
                $payroll->year,
                $request->stripeToken
            );

            if ($result['success']) {
                $payroll->update([
                    'payment_status' => 'paid',
                    'stripe_charge_id' => $result['charge_id'],
                    'paid_at' => now(),
                ]);

                $this->activityLogger->log(
                    logName: 'payroll',
                    description: 'payroll_payment',
                    subject: $payroll,
                    properties: [
                        'payment_status'        => $payroll->payment_status,
                        'stripe_charge_id'      => $payroll->stripe_charge_id,
                        'paid_at'               => $payroll->paid_at,
                    ]
                );

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Payment successful!',
                    'data' => [
                        'charge_id' => $result['charge_id'],
                        'amount' => $result['amount'],
                    ],
                ]);
            }

            $payroll->update(['payment_status' => 'failed']);
            DB::commit();

            return response()->json([
                'status' => 'error',
                'message' => $result['error'],
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
