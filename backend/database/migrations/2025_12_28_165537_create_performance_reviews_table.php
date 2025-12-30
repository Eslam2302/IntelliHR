<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evaluation_cycle_id')->constrained()->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->nullable()->constrained('employees')->nullOnDelete();

            // Status Workflow
            $table->enum('status', [
                'not_started',
                'self_assessment_in_progress',
                'self_assessment_submitted',
                'manager_review_in_progress',
                'manager_review_submitted',
                'awaiting_acknowledgment',
                'acknowledged',
                'completed',
            ])->default('not_started');

            // Self Assessment Section
            $table->text('self_assessment_summary')->nullable();
            $table->json('self_assessment_achievements')->nullable();
            $table->json('self_assessment_challenges')->nullable();
            $table->json('self_assessment_goals')->nullable();
            $table->timestamp('self_assessment_submitted_at')->nullable();

            // Manager Review Section
            $table->text('manager_summary')->nullable();
            $table->json('manager_strengths')->nullable();
            $table->json('manager_areas_for_improvement')->nullable();
            $table->json('manager_goals_for_next_period')->nullable();
            $table->text('manager_additional_comments')->nullable();
            $table->timestamp('manager_review_submitted_at')->nullable();

            // Final Ratings
            $table->string('overall_rating')->nullable(); // 'exceeds', 'meets', 'below'
            $table->decimal('overall_score', 5, 2)->nullable();

            // Outcomes
            $table->boolean('promotion_recommended')->default(false);
            $table->decimal('salary_increase_percentage', 5, 2)->nullable();
            $table->decimal('bonus_amount', 10, 2)->nullable();
            $table->json('recommended_training')->nullable();
            $table->json('development_plan')->nullable();

            // Employee Acknowledgment
            $table->timestamp('acknowledged_at')->nullable();
            $table->text('employee_acknowledgment_comments')->nullable();

            // Metadata
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['evaluation_cycle_id', 'employee_id']);
            $table->index(['reviewer_id', 'status']);
            $table->index('overall_rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_reviews');
    }
};
