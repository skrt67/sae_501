<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #e8e8e8;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1a1a1a;">Asano</h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(0, 0, 0, 0.45);">Gestion de projets agile</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">
                                Réinitialisation de mot de passe
                            </h2>
                            
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: rgba(0, 0, 0, 0.85);">
                                Bonjour <strong>{{ $user->name }}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: rgba(0, 0, 0, 0.85);">
                                Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                            </p>
                            
                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 8px 0 24px 0;">
                                        <a href="{{ $resetUrl }}" 
                                           style="display: inline-block; padding: 14px 32px; background-color: #000000; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;">
                                            Réinitialiser mon mot de passe
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: rgba(0, 0, 0, 0.65);">
                                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
                            </p>
                            
                            <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f8f9fa; border-radius: 6px; font-size: 13px; color: rgba(0, 0, 0, 0.65); word-break: break-all;">
                                {{ $resetUrl }}
                            </p>
                            
                            <div style="padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 6px; margin-bottom: 24px;">
                                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #856404;">
                                    <strong>⚠️ Important :</strong> Ce lien est valable pendant 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                                </p>
                            </div>
                            
                            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(0, 0, 0, 0.65);">
                                Cordialement,<br>
                                <strong>L'équipe Asano</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #e8e8e8; background-color: #f8f9fa; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; color: rgba(0, 0, 0, 0.45);">
                                © {{ date('Y') }} Asano - Tous droits réservés
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
