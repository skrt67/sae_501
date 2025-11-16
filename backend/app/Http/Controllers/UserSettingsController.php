<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserSettingsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        return response()->json($user->settings ?: []);
    }

    public function update(Request $request)
    {
        $request->validate([
            'notif_task_assigned' => 'boolean',
            'notif_due_soon' => 'boolean',
            'notif_email_critical' => 'boolean',
            'theme' => 'string|in:light,dark',
            'timezone' => 'string|max:255',
        ]);

        $user = $request->user();
        $user->settings = array_merge($user->settings ?: [], $request->all());
        $user->save();

        return response()->json($user->settings);
    }
}
