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
        // Ne rien faire - ces colonnes sont utilisées
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restore users columns
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
            $table->json('settings')->nullable()->after('avatar_url');
            $table->string('role')->nullable()->after('settings');
        });

        // Restore epics columns
        Schema::table('epics', function (Blueprint $table) {
            $table->enum('phase', ['plan', 'test', 'develop', 'launch'])->nullable()->after('status');
        });

        // Restore sprints columns
        Schema::table('sprints', function (Blueprint $table) {
            $table->string('phase')->nullable()->after('name');
            $table->text('goal')->nullable()->after('phase');
        });

        // Recreate sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }
};
