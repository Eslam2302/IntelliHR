<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competencies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->enum('category', [
                'technical',
                'behavioral',
                'leadership',
                'core_values',
            ]);
            $table->enum('applicable_to', [
                'all',
                'individual_contributor',
                'manager',
                'senior_manager',
                'executive',
            ])->default('all');
            $table->json('rating_descriptors'); // Descriptions for each rating level
            $table->integer('weight')->default(1);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['category', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competencies');
    }
};
