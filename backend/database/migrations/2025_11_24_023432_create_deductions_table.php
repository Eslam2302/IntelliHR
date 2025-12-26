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
        Schema::create('deductions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('payroll_id')
                ->nullable()
                ->constrained('payrolls')
                ->onDelete('cascade');

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            $table->string('type');
            $table->decimal('amount', 10, 2);

            $table->timestamps();

            $table->index(['employee_id', 'payroll_id']);

            // Additional indexes for search and filtering
            $table->index('employee_id');
            $table->index('payroll_id');
            $table->index('type');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deductions');
    }
};
