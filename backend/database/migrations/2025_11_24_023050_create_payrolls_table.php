<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            $table->integer('year');
            $table->integer('month');

            $table->decimal('basic_salary', 12, 2);
            $table->decimal('allowances', 12, 2)->default(0);

            $table->decimal('deductions', 12, 2)->default(0);

            $table->decimal('net_pay', 12, 2);

            $table->timestamp('processed_at');

            $table->string('payment_status')->default('pending');
            $table->string('stripe_charge_id')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();

            $table->unique(['employee_id', 'year', 'month']);

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('payment_status');
            $table->index('month');
            $table->index('year');
            $table->index('created_at');

            // Composite index for common filter combinations
            $table->index(['employee_id', 'payment_status', 'month', 'year']);

            // Soft deletes for audit trail
            $table->softDeletes();
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
