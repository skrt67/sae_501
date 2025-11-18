<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetController extends Controller
{
    /**
     * Envoyer un lien de réinitialisation de mot de passe
     */
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Ne pas révéler si l'email existe ou non (sécurité)
            return response()->json([
                'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'
            ], 200);
        }

        // Générer un token de réinitialisation
        $token = Str::random(64);
        
        // Stocker le token dans la base de données
        \DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            [
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // Envoyer l'email avec le lien
        try {
            \Mail::to($user->email)->send(new \App\Mail\PasswordResetMail($user, $token));
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email reset password: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.',
            'token' => config('app.env') === 'local' ? $token : null // Token visible en dev uniquement
        ], 200);
    }

    /**
     * Réinitialiser le mot de passe
     */
    public function reset(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8', 'confirmed']
        ]);

        // Vérifier le token
        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            throw ValidationException::withMessages([
                'email' => ['Ce lien de réinitialisation est invalide.']
            ]);
        }

        // Vérifier que le token correspond
        if (!Hash::check($request->token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Ce lien de réinitialisation est invalide.']
            ]);
        }

        // Vérifier que le token n'a pas expiré (1 heure)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'token' => ['Ce lien de réinitialisation a expiré.']
            ]);
        }

        // Réinitialiser le mot de passe
        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Utilisateur introuvable.']
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Supprimer le token utilisé
        \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Votre mot de passe a été réinitialisé avec succès.'
        ], 200);
    }

    /**
     * Vérifier la validité d'un token
     */
    public function verifyToken(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email']
        ]);

        $resetRecord = \DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['valid' => false], 200);
        }

        // Vérifier l'expiration
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['valid' => false], 200);
        }

        return response()->json(['valid' => true], 200);
    }
}
