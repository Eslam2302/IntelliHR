<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payroll;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PayrollPaymentController extends Controller
{
    public function __construct(
        protected StripePaymentService $stripeService
    ) {}

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
