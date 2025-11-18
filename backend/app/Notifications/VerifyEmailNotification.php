<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends BaseVerifyEmail
{
    /**
     * Get the verification URL for the given notifiable.
     */
    protected function verificationUrl($notifiable)
    {
        return \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Vérifiez votre adresse email')
            ->greeting('Bonjour ' . $notifiable->name . ',')
            ->line('Merci de vous être inscrit sur Asano !')
            ->line('Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.')
            ->action('Vérifier mon email', $verificationUrl)
            ->line('Ce lien expirera dans 60 minutes.')
            ->line('Si vous n\'avez pas créé de compte, aucune action n\'est requise.')
            ->salutation('Cordialement, L\'équipe Asano');
    }
}
