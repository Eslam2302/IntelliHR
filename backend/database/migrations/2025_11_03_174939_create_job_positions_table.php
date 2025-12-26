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
        Schema::create('job_positions', function (Blueprint $table) {
            $table->id();
            $table->string('title')->unique();
            $table->string('grade');
            $table->foreignId('department_id')->constrained();
            $table->decimal('min_salary', 10, 2);
            $table->decimal('max_salary', 10, 2);
            $table->text('responsibilities')->nullable();
            $table->timestamps();

            // Indexes for search and filtering
            $table->index('title');
            $table->index('grade');
            $table->index('department_id');
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
        Schema::dropIfExists('job_positions');
    }
};
