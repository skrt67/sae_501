import React, { useState } from 'react'
import { Button, message } from 'antd'
import { Mail, X } from 'lucide-react'
import { useAuth } from '../modules/auth/AuthContext'

export default function EmailVerificationBanner() {
  const { user, resendVerificationEmail, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Ne rien afficher si l'email est déjà vérifié ou si le banner est masqué
  if (!user || user.email_verified_at || dismissed) {
    return null
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      await resendVerificationEmail()
      message.success('Email de vérification envoyé !')
      // Vérifier si l'utilisateur a vérifié son email
      setTimeout(() => {
        refreshUser()
      }, 2000)
    } catch (err: any) {
      message.error(err.message || 'Erreur lors de l\'envoi de l\'email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        background: '#fff3cd',
        borderBottom: '1px solid #ffc107',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <Mail size={20} style={{ color: '#856404' }} aria-hidden="true" />
        <div style={{ flex: 1 }}>
          <span style={{ color: '#856404', fontSize: '14px', fontWeight: '500' }}>
            Veuillez vérifier votre adresse e-mail
          </span>
          <span style={{ color: '#856404', fontSize: '13px', marginLeft: '8px' }}>
            Un email de vérification a été envoyé à {user.email}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Button
          size="small"
          onClick={handleResend}
          loading={loading}
          disabled={loading}
          aria-label="Renvoyer l'email de vérification"
          style={{
            background: 'transparent',
            border: '1px solid #856404',
            color: '#856404',
            fontWeight: '500'
          }}
        >
          Renvoyer l'email
        </Button>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Fermer la bannière de vérification"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            color: '#856404'
          }}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
