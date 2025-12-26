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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();

            // Foreign key to employees table
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            // Document type (e.g., contract, ID, resume)
            $table->string('doc_type');

            // Path to the stored file
            $table->string('file_path');

            // When the file was uploaded
            $table->timestamp('uploaded_at')->nullable();

            $table->timestamps();

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('doc_type');
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
        Schema::dropIfExists('documents');
    }
};
