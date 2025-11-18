<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInvitationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invitation $invitation
    ) {
        //
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $projectName = $this->invitation->project ? $this->invitation->project->name : 'un projet';
        
        return new Envelope(
            subject: 'Invitation à rejoindre le projet ' . $projectName,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.project-invitation',
            with: [
                'projectName' => $this->invitation->project ? $this->invitation->project->name : 'un projet',
                'workspaceName' => $this->invitation->workspace ? $this->invitation->workspace->name : 'un workspace',
                'inviterName' => $this->invitation->inviter ? $this->invitation->inviter->name : 'Un utilisateur',
                'role' => $this->invitation->role,
                'acceptUrl' => config('app.frontend_url') . '/invitations-received',
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
