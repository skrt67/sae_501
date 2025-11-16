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
        Schema::table('epics', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('color');
            $table->date('end_date')->nullable()->after('start_date');
            $table->enum('status', ['planned', 'in_progress', 'completed', 'on_hold'])->default('planned')->after('end_date');
            $table->enum('phase', ['plan', 'test', 'develop', 'launch'])->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('epics', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'status', 'phase']);
        });
    }
};
