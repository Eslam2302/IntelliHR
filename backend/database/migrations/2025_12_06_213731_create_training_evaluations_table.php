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
        Schema::create('training_evaluations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('training_id');
            $table->tinyInteger('rating'); // 1–5
            $table->text('feedback')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')
                ->references('id')->on('employees')
                ->cascadeOnDelete();

            $table->foreign('training_id')
                ->references('id')->on('training_sessions')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_evaluations');
    }
};
