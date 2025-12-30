<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_review_id')->constrained()->cascadeOnDelete();
            $table->foreignId('competency_id')->constrained()->cascadeOnDelete();

            // Self Rating
            $table->integer('self_rating')->nullable(); // 1-5
            $table->text('self_rating_comment')->nullable();

            // Manager Rating
            $table->integer('manager_rating')->nullable(); // 1-5
            $table->text('manager_rating_comment')->nullable();

            $table->timestamps();

            $table->unique(['performance_review_id', 'competency_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('review_ratings');
    }
};
