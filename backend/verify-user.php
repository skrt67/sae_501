<?php

/**
 * Script pour vérifier manuellement un utilisateur
 * Usage: php verify-user.php email@example.com
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if ($argc < 2) {
    echo "Usage: php verify-user.php email@example.com\n";
    exit(1);
}

$email = $argv[1];

$user = \App\Models\User::where('email', $email)->first();

if (!$user) {
    echo "❌ Utilisateur non trouvé: $email\n";
    exit(1);
}

if ($user->hasVerifiedEmail()) {
    echo "✅ L'utilisateur $email est déjà vérifié\n";
    exit(0);
}

$user->markEmailAsVerified();

echo "✅ Email vérifié avec succès pour: $email\n";
echo "   L'utilisateur peut maintenant se connecter normalement.\n";
