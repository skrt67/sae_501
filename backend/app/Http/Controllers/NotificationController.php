<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class NotificationController extends Controller
{
    /**
     * Récupérer toutes les notifications de l'utilisateur
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->data['type'] ?? 'general',
                    'title' => $notification->data['title'] ?? 'Notification',
                    'message' => $notification->data['message'] ?? '',
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'data' => $notification->data,
                ];
            });

        return response()->json($notifications);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $notification = $user->notifications()->find($id);

        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }

        $notification->delete();

        return response()->json(['success' => true]);
    }
}
