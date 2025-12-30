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
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            $table->string('first_name');
            $table->string('last_name');

            $table->string('personal_email')->nullable();
            $table->string('phone')->nullable();
            $table->enum('gender', ['male', 'female']);
            $table->string('national_id');
            $table->date('birth_date');
            $table->text('address')->nullable();
            $table->enum('employee_status', ['active', 'probation', 'resigned', 'terminated'])->default('probation');

            $table->foreignId('department_id')->nullable()->constrained();
            $table->foreignId('manager_id')->nullable()->constrained('employees');
            $table->foreignId('job_id')->nullable()->constrained('job_positions')->nullOnDelete();

            $table->date('hire_date');
            $table->timestamps();

            // Indexes for search and filtering
            $table->index('first_name');
            $table->index('last_name');
            $table->index('personal_email');
            $table->index('phone');
            $table->index('employee_status');
            $table->index('department_id');
            $table->index('manager_id');
            $table->index('created_at');

            // Composite indexes for common filter combinations
            $table->index(['department_id', 'employee_status']);

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
        Schema::dropIfExists('employees');
    }
};
