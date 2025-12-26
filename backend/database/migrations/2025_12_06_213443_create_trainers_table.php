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
        Schema::create('trainers', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['internal', 'external']);
            $table->unsignedBigInteger('employee_id')->nullable(); // internal only
            $table->string('name')->nullable(); // external OR fallback
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company')->nullable(); // external trainer company
            $table->timestamps();

            $table->foreign('employee_id')
                ->references('id')
                ->on('employees')
                ->nullOnDelete();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('name');
            $table->index('email');
            $table->index('created_at');

            // Soft deletes for audit trail
            $table->softDeletes();
            $table->index('deleted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainers');
    }
};
