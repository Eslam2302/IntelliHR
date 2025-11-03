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

            $table->foreignId('user_id')->constrained()->unique();

            $table->string('name');
            $table->string('personal_email')->nullable();
            $table->string('phone')->nullable();

            $table->foreignId('department_id')->nullable()->constrained();
            $table->foreignId('manager_id')->nullable()->constrained('employees');

            $table->string('job_title');
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
