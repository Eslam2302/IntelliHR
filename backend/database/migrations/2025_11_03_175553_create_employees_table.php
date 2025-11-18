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
            $table->enum('employee_status', ['active', 'resigned', 'terminated']);

            $table->foreignId('department_id')->nullable()->constrained();
            $table->foreignId('manager_id')->nullable()->constrained('employees');
            $table->foreignId('job_id')->nullable()->constrained('job_positions')->nullOnDelete();

            $table->date('hire_date');
            $table->timestamps();
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
