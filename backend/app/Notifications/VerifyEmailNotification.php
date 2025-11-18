<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends BaseVerifyEmail
{
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
            ->line('Si vous n\'avez pas créé de compte, aucune action n\'est requise.')
            ->salutation('Cordialement, L\'équipe Asano');
    }
}
