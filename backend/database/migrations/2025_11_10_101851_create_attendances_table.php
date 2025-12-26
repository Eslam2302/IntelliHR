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
            $table->timestamp('check_in');
            $table->boolean('is_late')->default(false);
            $table->timestamp('check_out')->nullable();
            $table->decimal('calculated_hours', 8, 2)->nullable();

            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('check_in');
            $table->index('created_at');
            $table->index('is_late');

            // Composite index for common filter combinations
            $table->index(['employee_id', 'check_in']);
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
