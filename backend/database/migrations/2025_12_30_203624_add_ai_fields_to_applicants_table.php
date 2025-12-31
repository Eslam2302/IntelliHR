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
        Schema::table('applicants', function (Blueprint $table) {
            $table->decimal('ai_score', 5, 2)->nullable()->after('resume_path');
            $table->json('ai_analysis')->nullable()->after('ai_score');
            $table->json('ai_matched_skills')->nullable()->after('ai_analysis');
            $table->json('ai_missing_skills')->nullable()->after('ai_matched_skills');
            $table->enum('ai_recommendation', ['strong_match', 'good_match', 'weak_match', 'not_suitable'])->nullable()->after('ai_missing_skills');
            $table->timestamp('ai_analyzed_at')->nullable()->after('ai_recommendation');
            $table->enum('ai_analysis_status', ['pending', 'processing', 'completed', 'failed'])->default('pending')->after('ai_analyzed_at');
            
            $table->index('ai_analysis_status');
            $table->index('ai_score');
            $table->index('ai_recommendation');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropIndex(['ai_analysis_status']);
            $table->dropIndex(['ai_score']);
            $table->dropIndex(['ai_recommendation']);
            
            $table->dropColumn([
                'ai_score',
                'ai_analysis',
                'ai_matched_skills',
                'ai_missing_skills',
                'ai_recommendation',
                'ai_analyzed_at',
                'ai_analysis_status',
            ]);
        });
    }
};
