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
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('serial_number')->unique();
            $table->string('condition');
            $table->enum('status', ['available', 'assigned', 'maintenance', 'retired'])->default('available');
            $table->timestamps();

            // Indexes for search and filtering
            $table->index('name');
            $table->index('serial_number');
            $table->index('status');
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
        Schema::dropIfExists('assets');
    }
};
