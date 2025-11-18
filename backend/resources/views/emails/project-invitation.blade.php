<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1890ff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background: #1890ff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Invitation à un Projet</h1>
        </div>
        <div class="content">
            <p>Bonjour,</p>
            
            <p><strong>{{ $inviterName }}</strong> vous invite à rejoindre le projet <strong>{{ $projectName }}</strong> dans le workspace <strong>{{ $workspaceName }}</strong>.</p>
            
            <p>Votre rôle : <strong>{{ ucfirst($role) }}</strong></p>
            
            <p style="text-align: center;">
                <a href="{{ $acceptUrl }}" class="button">Accepter l'invitation</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                Si vous n'avez pas de compte, créez-en un avec cette adresse email pour accepter l'invitation.
            </p>
            
            <p style="font-size: 14px; color: #666;">
                Cette invitation expire dans 7 jours.
            </p>
        </div>
        <div class="footer">
            <p>Cet email a été envoyé par Asano - Gestion de Projet</p>
        </div>
    </div>
</body>
</html>
