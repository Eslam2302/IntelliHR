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
        Schema::create('training_certificates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_training_id');
            $table->date('issued_at')->nullable();
            $table->string('certificate_path'); // PDF path
            $table->timestamps();

            $table->foreign('employee_training_id')
                ->references('id')->on('employee_trainings')
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_certificates');
    }
};
