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
        Schema::create('benefits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->string('benefit_type');
            $table->decimal('amount', 10, 2);
            $table->boolean('is_deduction')->default(false);
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('benefit_type');
            $table->index('is_deduction');
            $table->index('created_at');

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
        Schema::dropIfExists('benefits');
    }
};
