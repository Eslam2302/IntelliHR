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
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();

            // Relations
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->onDelete('cascade');

            $table->foreignId('leave_type_id')
                ->constrained('leave_types')
                ->onDelete('cascade');

            // Entitlements
            $table->integer('total_entitlement')->default(0);  // total days employee can take
            $table->integer('used_days')->default(0);         // days already taken
            $table->integer('remaining_days')->default(0);    // remaining = total - used

            // Year of the leave balance
            $table->year('year');

            // Ensure one record per employee per leave type per year
            $table->unique(['employee_id', 'leave_type_id', 'year']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};
