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
        Schema::create('hiring_stages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('job_id');
            $table->string('stage_name');
            $table->integer('order');
            $table->timestamps();

            $table->foreign('job_id')
                ->references('id')
                ->on('job_posts')
                ->onDelete('cascade');

            // Indexes for search and filtering
            $table->index('job_id');
            $table->index('order');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hiring_stages');
    }
};
