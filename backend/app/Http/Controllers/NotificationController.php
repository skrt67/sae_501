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
        
        // Pour l'instant, on retourne un tableau vide
        // Vous pourrez implémenter la table notifications plus tard
        return response()->json([]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markAsRead(Request $request, $id)
    {
        return response()->json(['success' => true]);
    }

    /**
     * Marquer toutes les notifications comme lues
     */
    public function markAllAsRead(Request $request)
    {
        return response()->json(['success' => true]);
    }

    /**
     * Supprimer une notification
     */
    public function destroy(Request $request, $id)
    {
        return response()->json(['success' => true]);
    }
}
