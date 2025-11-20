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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');

            // Contract dates
            $table->date('start_date');
            $table->date('end_date')->nullable();

            // Contract type enum
            $table->enum('contract_type', [
                'permanent',
                'full_time',
                'part_time',
                'fixed_term',
                'temporary',
                'project_based',
                'seasonal',
                'probation',
                'internship',
                'consultant',
                'contractor',
                'freelance',
                'hourly',
                'commission_based',
                'on_call'
            ]);
            $table->unsignedSmallInteger('probation_period_days')->default(90);
            $table->decimal('salary', 12, 2);
            $table->text('terms')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
