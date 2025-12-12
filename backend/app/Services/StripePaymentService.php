<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Exception;
use Stripe\Stripe;
use Stripe\Charge;
use Stripe\Exception\CardException;

class StripePaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Process payroll payment
     */
    public function processPayrollPayment(
        int $payrollId,
        float $amount,
        string $employeeName,
        int $month,
        int $year,
        string $stripeToken
    ): array {
        try {
            $charge = Charge::create([
                'amount' => $amount * 100, // Convert to cents
                'currency' => 'usd',
                'source' => $stripeToken,
                'description' => "Payroll: {$employeeName} - {$month}/{$year}",
                'metadata' => [
                    'payroll_id' => $payrollId,
                    'employee_name' => $employeeName,
                    'month' => $month,
                    'year' => $year,
                ]
            ]);

            Log::info('Payment successful', [
                'payroll_id' => $payrollId,
                'charge_id' => $charge->id
            ]);

            return [
                'success' => true,
                'charge_id' => $charge->id,
                'amount' => $amount,
            ];
        } catch (CardException $e) {
            return [
                'success' => false,
                'error' => $e->getError()->message,
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }
}