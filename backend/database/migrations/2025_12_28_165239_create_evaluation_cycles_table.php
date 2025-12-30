<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['annual', 'semi_annual', 'quarterly', 'probation']);
            $table->integer('year');
            $table->enum('period', ['H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', 'full_year'])->nullable();

            // Timeline
            $table->date('start_date');
            $table->date('end_date');
            $table->date('self_assessment_deadline');
            $table->date('manager_review_deadline');
            $table->date('calibration_deadline')->nullable();
            $table->date('final_review_deadline');

            // Status
            $table->enum('status', [
                'draft',
                'published',
                'self_assessment_open',
                'manager_review_open',
                'calibration',
                'completed',
                'cancelled',
            ])->default('draft');

            // Configuration
            $table->json('rating_scale')->nullable();
            $table->boolean('include_self_assessment')->default(true);
            $table->boolean('include_goals')->default(true);

            $table->text('description')->nullable();
            $table->foreignId('created_by')->constrained('employees')->onDelete('cascade');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['year', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_cycles');
    }
};
