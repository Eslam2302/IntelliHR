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
        Schema::create('allowances', function (Blueprint $table) {
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

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('payroll_id');
            $table->index('type');
            $table->index('created_at');

            // Composite index for common filter combinations
            $table->index(['employee_id', 'payroll_id']);

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
        Schema::dropIfExists('allowances');
    }
};
