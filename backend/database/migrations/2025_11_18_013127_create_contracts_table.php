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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');

            // Contract dates
            $table->date('start_date');
            $table->date('end_date')->nullable();

            // Contract type enum
            $table->enum('contract_type', [
                'permanent',
                'full_time',
                'part_time',
                'fixed_term',
                'temporary',
                'project_based',
                'seasonal',
                'probation',
                'internship',
                'consultant',
                'contractor',
                'freelance',
                'hourly',
                'commission_based',
                'on_call',
            ]);
            $table->unsignedSmallInteger('probation_period_days')->default(90);
            $table->decimal('salary', 12, 2);
            $table->text('terms')->nullable();

            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('contract_type');
            $table->index('created_at');
            $table->index(['employee_id', 'start_date']);

            // Composite index for common filter combinations
            $table->index(['employee_id', 'contract_type', 'start_date']);

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
        Schema::dropIfExists('contracts');
    }
};
