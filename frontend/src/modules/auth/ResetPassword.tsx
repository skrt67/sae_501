import { useState, useEffect } from 'react'
import { Form, Input, Button, message } from 'antd'
import { Lock, CheckCircle } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    verifyToken()
  }, [])

  const verifyToken = async () => {
    if (!token || !email) {
      message.error('Lien invalide')
      setVerifying(false)
      return
    }

    try {
      const response = await fetch('/api/password/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ token, email })
      })

      const data = await response.json()
      setTokenValid(data.valid)
      
      if (!data.valid) {
        message.error('Ce lien de réinitialisation est invalide ou a expiré')
      }
    } catch (error) {
      message.error('Erreur de vérification du lien')
      setTokenValid(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleSubmit = async (values: { password: string; password_confirmation: string }) => {
    setLoading(true)
    try {
      const response = await fetch('/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          token,
          email,
          password: values.password,
          password_confirmation: values.password_confirmation
        })
      })

      if (response.ok) {
        setResetSuccess(true)
        message.success('Mot de passe réinitialisé avec succès !')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        const error = await response.json()
        message.error(error.message || 'Erreur lors de la réinitialisation')
      }
    } catch (error) {
      message.error('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: '#ffffff' }}>
          <div className="spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px auto'
          }} />
          <p style={{ fontSize: '16px', margin: 0 }}>Vérification du lien...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
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
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#ff4d4f',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <Lock size={32} style={{ color: '#ffffff' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px 0' }}>
            Lien invalide
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(0, 0, 0, 0.65)', margin: '0 0 24px 0' }}>
            Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.
          </p>
          <Button
            size="large"
            block
            onClick={() => navigate('/forgot-password')}
            style={{
              height: '48px',
              fontSize: '16px',
              fontWeight: 600,
              borderRadius: '8px'
            }}
            aria-label="Demander un nouveau lien"
          >
            Demander un nouveau lien
          </Button>
        </div>
      </div>
    )
  }

  if (resetSuccess) {
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
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#52c41a',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto'
          }}>
            <CheckCircle size={32} style={{ color: '#ffffff' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px 0' }}>
            Mot de passe réinitialisé !
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
            Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...
          </p>
        </div>
      </div>
    )
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
            <Lock size={32} style={{ color: '#ffffff' }} />
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#1a1a1a',
            margin: '0 0 12px 0'
          }}>
            Nouveau mot de passe
          </h1>
          <p style={{
            fontSize: '15px',
            color: 'rgba(0, 0, 0, 0.65)',
            margin: 0,
            lineHeight: 1.6
          }}>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label={<span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Nouveau mot de passe</span>}
            name="password"
            rules={[
              { required: true, message: 'Veuillez entrer un mot de passe' },
              { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
            ]}
          >
            <Input.Password
              prefix={<Lock size={18} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
              placeholder="Minimum 8 caractères"
              size="large"
              style={{ borderRadius: '8px' }}
              aria-label="Nouveau mot de passe"
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>Confirmer le mot de passe</span>}
            name="password_confirmation"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Veuillez confirmer votre mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                }
              })
            ]}
          >
            <Input.Password
              prefix={<Lock size={18} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />}
              placeholder="Confirmez votre mot de passe"
              size="large"
              style={{ borderRadius: '8px' }}
              aria-label="Confirmer le mot de passe"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
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
              aria-label="Réinitialiser le mot de passe"
            >
              Réinitialiser le mot de passe
            </Button>
          </Form.Item>
        </Form>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
