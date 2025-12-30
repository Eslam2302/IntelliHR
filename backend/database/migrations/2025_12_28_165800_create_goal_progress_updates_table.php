<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_progress_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goal_id')->constrained()->cascadeOnDelete();
            $table->foreignId('updated_by')->constrained('employees')->cascadeOnDelete();

            $table->text('update_note');
            $table->integer('progress_percentage');
            $table->enum('status', ['on_track', 'at_risk', 'blocked', 'completed']);
            $table->date('update_date');

            $table->timestamps();

            $table->index('goal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_progress_updates');
    }
};
