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
        Schema::create('job_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->text('requirements')->nullable();
            $table->text('responsibilities')->nullable();


            $table->unsignedBigInteger('department_id');
            $table->foreign('department_id')
                ->references('id')
                ->on('departments')
                ->onDelete('cascade');

            $table->enum('job_type', ['internal', 'external', 'both'])->default('external');
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->timestamp('posted_at')->nullable();
            $table->string('linkedin_job_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_posts');
    }
};
