<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Auth\Events\Registered;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255','unique:users,email'],
            'password' => ['required', Password::min(8)],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // Déclencher l'événement d'inscription qui enverra l'email de vérification
        event(new Registered($user));

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Compte créé. Veuillez vérifier votre email.'
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $data['email'])->first();
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }
        return response()->json(['ok' => true]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $user->name = $data['name'];
        $user->save();

        return response()->json($user);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'], // Max 2MB
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->avatar_url = Storage::url($path);
        $user->save();

        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', Password::min(8)->mixedCase()->numbers()->symbols(), 'confirmed'],
            'password_confirmation' => ['required'],
        ]);

        $user = $request->user();
        $user->password = Hash::make($data['password']);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
    }
}


