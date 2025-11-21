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
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('code')->unique(); // AL, SL, ML

            // Annual entitlements per year
            $table->unsignedSmallInteger('annual_entitlement')->default(0);

            // Accrual method
            $table->enum('accrual_policy', ['none', 'monthly', 'annual'])->default('none');

            // Carryover rules
            $table->unsignedSmallInteger('carry_over_limit')->default(0);

            // Request restrictions
            $table->unsignedTinyInteger('min_request_days')->default(1);
            $table->unsignedTinyInteger('max_request_days')->default(30);

            // Workflow
            $table->boolean('requires_hr_approval')->default(false);

            // Activation for controll hide without deleting it
            $table->boolean('is_active')->default(true);

            $table->enum('payment_type', ['paid', 'unpaid', 'partially_paid'])->default('paid');
            $table->boolean('requires_attachment')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
