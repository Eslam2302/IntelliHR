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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('employee_id');
            $table->decimal('amount', 10, 2);
            $table->date('expense_date');

            $table->unsignedBigInteger('category_id');

            $table->enum('status', ['pending', 'approved', 'rejected'])
                ->default('pending');

            $table->text('notes')->nullable();

            $table->string('receipt_path')->nullable();

            $table->timestamps();

            $table->foreign('employee_id')
                ->references('id')
                ->on('employees')
                ->onDelete('cascade');
            $table->foreign('category_id')
                ->references('id')
                ->on('expense_categories')
                ->onDelete('cascade');

            // Indexes for search and filtering
            $table->index('employee_id');
            $table->index('status');
            $table->index('category_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
