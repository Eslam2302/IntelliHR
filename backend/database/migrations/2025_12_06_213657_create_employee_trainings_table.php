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
        Schema::create('employee_trainings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('training_id');
            $table->enum('status', ['enrolled', 'completed', 'cancelled'])->default('enrolled');
            $table->date('completion_date')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')
                ->references('id')->on('employees')
                ->cascadeOnDelete();

            $table->foreign('training_id')
                ->references('id')->on('training_sessions')
                ->cascadeOnDelete();

            $table->unique(['employee_id', 'training_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employee_trainings');
    }
};
