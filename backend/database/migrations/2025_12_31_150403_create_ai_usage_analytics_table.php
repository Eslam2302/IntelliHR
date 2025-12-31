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
        Schema::create('ai_usage_analytics', function (Blueprint $table) {
            $table->id();
            
            // Feature type: 'resume_analysis' or 'chat_assistant'
            $table->enum('feature_type', ['resume_analysis', 'chat_assistant']);
            
            // User/Employee tracking
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('employee_id')->nullable()->constrained('employees')->onDelete('set null');
            
            // Reference to related records
            $table->unsignedBigInteger('applicant_id')->nullable();
            $table->unsignedBigInteger('conversation_id')->nullable();
            
            // OpenAI API details
            $table->string('model')->default('gpt-4o-mini');
            $table->integer('tokens_used')->default(0);
            $table->decimal('estimated_cost', 10, 6)->default(0); // Cost in USD
            
            // Request details
            $table->text('prompt_preview')->nullable(); // First 200 chars of prompt
            $table->integer('prompt_length')->default(0);
            $table->integer('response_length')->default(0);
            
            // Performance metrics
            $table->integer('response_time_ms')->nullable(); // Response time in milliseconds
            
            // Status
            $table->enum('status', ['success', 'failed', 'rate_limited'])->default('success');
            $table->text('error_message')->nullable();
            
            $table->timestamps();
            
            // Indexes for analytics queries
            $table->index('feature_type');
            $table->index('user_id');
            $table->index('employee_id');
            $table->index('created_at');
            $table->index(['feature_type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['employee_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_analytics');
    }
};
