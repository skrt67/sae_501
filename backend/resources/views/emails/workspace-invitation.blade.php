<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation à rejoindre {{ $workspaceName }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #000000;
            color: #ffffff;
            padding: 30px;
            text-align: center;
            border-radius: 4px 4px 0 0;
        }
        .logo {
            width: 48px;
            height: 48px;
            background: #ffffff;
            color: #000000;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            font-weight: 900;
            margin-bottom: 16px;
        }
        .content {
            background: #ffffff;
            padding: 40px 30px;
            border: 1px solid #e0e0e0;
            border-top: none;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: #000000;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 600;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666666;
            font-size: 14px;
            padding: 20px;
        }
        .role-badge {
            display: inline-block;
            background: #f0f0f0;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 600;
            color: #000000;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">A</div>
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Asano</h1>
    </div>

    <div class="content">
        <h2 style="margin-top: 0; color: #000000;">Vous avez été invité !</h2>

        <p style="font-size: 16px; color: #333333;">
            <strong>{{ $inviterName }}</strong> vous invite à rejoindre l'équipe
            <strong>{{ $workspaceName }}</strong> sur Asano.
        </p>

        <p style="font-size: 15px; color: #666666;">
            Vous avez été invité avec le rôle : <span class="role-badge">{{ $role }}</span>
        </p>

        <p style="font-size: 15px; color: #666666;">
            Asano est une plateforme de gestion de projets Agile qui vous permet de collaborer
            efficacement avec votre équipe, de suivre vos projets et d'atteindre vos objectifs.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $acceptUrl }}" class="button">
                Voir l'invitation
            </a>
        </div>

        <p style="font-size: 13px; color: #999999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            Si vous n'avez pas de compte, vous devrez en créer un avec l'adresse email
            <strong>{{ $invitation->email }}</strong> pour accepter cette invitation.
        </p>
    </div>

    <div class="footer">
        <p>
            Cet email a été envoyé par <strong>Asano</strong><br>
            Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
        </p>
    </div>
</body>
</html>
