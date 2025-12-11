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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicant_id');
            $table->unsignedBigInteger('interviewer_id')->nullable();
            $table->timestamp('scheduled_at');
            $table->integer('score')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['scheduled', 'done', 'canceled'])->default('scheduled');
            $table->timestamps();

            $table->foreign('applicant_id')
                ->references('id')
                ->on('applicants')
                ->onDelete('cascade');
            $table->foreign('interviewer_id')
                ->references('id')
                ->on('employees')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};