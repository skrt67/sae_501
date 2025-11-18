<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('email');
            $table->string('token')->unique();
            $table->enum('role', ['owner', 'member'])->default('member');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
