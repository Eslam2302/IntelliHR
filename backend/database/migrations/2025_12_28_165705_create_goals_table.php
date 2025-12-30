<?php

// database/migrations/2024_01_01_000005_create_goals_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluation_cycle_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('set_by')->constrained('employees')->cascadeOnDelete();

            $table->string('title');
            $table->text('description');
            $table->enum('type', ['individual', 'team', 'departmental', 'company']);
            $table->enum('category', ['performance', 'development', 'behavioral']);

            // SMART Criteria
            $table->json('success_criteria'); // Measurable indicators
            $table->date('start_date');
            $table->date('target_date');
            $table->integer('weight')->default(1); // Importance weighting

            // Progress Tracking
            $table->enum('status', [
                'not_started',
                'in_progress',
                'at_risk',
                'completed',
                'cancelled',
            ])->default('not_started');
            $table->integer('progress_percentage')->default(0);

            // Completion Assessment
            $table->text('completion_notes')->nullable();
            $table->enum('achievement_level', [
                'exceeded',
                'fully_achieved',
                'partially_achieved',
                'not_achieved',
            ])->nullable();
            $table->integer('self_rating')->nullable(); // 1-5
            $table->integer('manager_rating')->nullable(); // 1-5
            $table->text('manager_comments')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
            $table->index('target_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
