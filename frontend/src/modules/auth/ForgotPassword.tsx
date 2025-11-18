import { useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { Mail, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [form] = Form.useForm()

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        setEmailSent(true)
        message.success('Email envoyé ! Vérifiez votre boîte de réception.')
      } else {
        const error = await response.json()
        message.error(error.message || 'Erreur lors de l\'envoi de l\'email')
      }
    } catch (error) {
      message.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#ffffff',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <Mail size={32} style={{ color: '#ffffff' }} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 12px 0'
          }}>
            Mot de passe oublié ?
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'rgba(0, 0, 0, 0.65)',
            margin: 0,
            lineHeight: 1.6
          }}>
            {emailSent 
              ? 'Un email de réinitialisation a été envoyé à votre adresse.'
              : 'Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'
            }
          </p>
        </div>

        {!emailSent ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label={<span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Email</span>}
              name="email"
              rules={[
                { required: true, message: 'Veuillez entrer votre email' },
                { type: 'email', message: 'Email invalide' }
              ]}
            >
              <Input
                prefix={<Mail size={18} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
                placeholder="votre@email.com"
                size="large"
                style={{ borderRadius: '8px' }}
                aria-label="Adresse email"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: '16px' }}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
                aria-label="Envoyer le lien de réinitialisation"
              >
                Envoyer le lien
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500
                }}
                aria-label="Retour à la page de connexion"
              >
                <ArrowLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          </Form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              padding: '24px',
              background: 'rgba(102, 126, 234, 0.1)',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '14px',
                color: 'rgba(0, 0, 0, 0.85)',
                margin: 0,
                lineHeight: 1.6
              }}>
                Si un compte existe avec cette adresse email, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
            </div>

            <Button
              size="large"
              block
              onClick={() => setEmailSent(false)}
              style={{
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '8px',
                marginBottom: '16px'
              }}
              aria-label="Renvoyer un email"
            >
              Renvoyer un email
            </Button>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500
              }}
              aria-label="Retour à la page de connexion"
            >
              <ArrowLeft size={16} />
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
