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
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            
            // Date field for easier date-based queries
            $table->date('date');
            
            $table->timestamp('check_in');
            $table->boolean('is_late')->default(false);
            $table->timestamp('check_out')->nullable();
            $table->decimal('calculated_hours', 8, 2)->nullable();
            
            // Location tracking
            $table->string('location')->nullable();
            $table->string('check_in_ip')->nullable();
            $table->string('check_out_ip')->nullable();
            
            // Notes field
            $table->text('notes')->nullable();
            
            // Status enum field
            $table->enum('status', ['present', 'absent', 'half_day', 'on_leave', 'late'])->default('present');
            
            // Break and overtime tracking
            $table->integer('break_duration_minutes')->nullable();
            $table->decimal('overtime_hours', 8, 2)->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('date');
            $table->index('check_in');
            $table->index('created_at');
            $table->index('is_late');
            $table->index('status');
            $table->index('deleted_at');

            // Composite indexes for common filter combinations
            $table->index(['employee_id', 'date']);
            $table->index(['employee_id', 'check_in']);
            
            // Unique constraint to prevent duplicate check-ins per day
            $table->unique(['employee_id', 'date'], 'unique_employee_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
