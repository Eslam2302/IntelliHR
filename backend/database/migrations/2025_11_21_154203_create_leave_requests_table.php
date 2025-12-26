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
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            $table->foreignId('leave_type_id')
                ->constrained('leave_types')
                ->onDelete('cascade');

            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedInteger('days');

            $table->text('reason')->nullable();
            $table->string('attachment')->nullable();

            // Workflow statuses
            $table->enum('status', ['pending', 'manager_approved', 'hr_approved', 'rejected', 'cancelled'])
                ->default('pending');

            $table->foreignId('manager_id')->nullable();
            $table->timestamp('manager_approved_at')->nullable();

            $table->foreignId('hr_id')->nullable();
            $table->timestamp('hr_approved_at')->nullable();

            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('status');
            $table->index('start_date');
            $table->index('end_date');
            $table->index('created_at');

            // Composite index for common filter combinations
            $table->index(['employee_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
