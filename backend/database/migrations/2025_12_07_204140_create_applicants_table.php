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
        Schema::create('applicants', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('job_id');
            $table->foreign('job_id')
                ->references('id')
                ->on('job_posts')
                ->onDelete('cascade');

            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->boolean('is_employee')->default(false);
            $table->enum('status', ['new', 'shortlisted', 'interviewed', 'hired', 'rejected'])->default('new');
            $table->string('source')->nullable();
            $table->integer('experience_years')->nullable();

            $table->unsignedBigInteger('current_stage_id')->nullable();
            $table->foreign('current_stage_id')
                ->references('id')
                ->on('hiring_stages')
                ->onDelete('set null');

            $table->string('resume_path');
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();

            // Indexes for search and filtering
            $table->index('first_name');
            $table->index('last_name');
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            $table->index('job_id');
            $table->index('current_stage_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicants');
    }
};
