import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Button, Input, message, Checkbox } from 'antd'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

export default function RegisterSplit() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      message.warning('Veuillez remplir tous les champs')
      return
    }

    if (password.length < 8) {
      message.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (!acceptTerms) {
      message.warning('Veuillez accepter les conditions d\'utilisation')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      message.success('Compte créé avec succès !')
      navigate('/dashboard')
    } catch (err) {
      message.error(err.message || 'Erreur lors de la création du compte')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="theme-light" style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#ffffff'
    }}>
      {/* Left Side - Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        background: '#ffffff'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#000000',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: '900' }}>A</span>
            </div>
            <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
              Asano
            </h1>
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '36px',
            fontWeight: '800',
            color: '#000000',
            marginBottom: '12px',
            letterSpacing: '-1px'
          }}>
            Créer un compte
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666666',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Rejoignez des milliers d'équipes qui gèrent leurs projets avec Asano
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px'
              }}>
                Nom complet
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jean Dupont"
                disabled={loading}
                prefix={<User size={18} style={{ color: '#666666' }} />}
                style={{
                  height: '48px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '400'
                }}
              />
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px'
              }}>
                Adresse e-mail
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                disabled={loading}
                prefix={<Mail size={18} style={{ color: '#666666' }} />}
                style={{
                  height: '48px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  background: '#ffffff',
                  fontSize: '15px',
                  fontWeight: '400'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                marginBottom: '8px'
              }}>
                Mot de passe
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                  disabled={loading}
                  prefix={<Lock size={18} style={{ color: '#666666' }} />}
                  style={{
                    height: '48px',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    background: '#ffffff',
                    paddingRight: '48px',
                    fontSize: '15px',
                    fontWeight: '400'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#666666',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div style={{ marginBottom: '32px' }}>
              <Checkbox
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              >
                <span style={{ fontSize: '14px', color: '#666666' }}>
                  J'accepte les{' '}
                  <a href="#" style={{ color: '#000000', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid #e0e0e0' }}>
                    conditions d'utilisation
                  </a>
                  {' '}et la{' '}
                  <a href="#" style={{ color: '#000000', textDecoration: 'none', fontWeight: '500', borderBottom: '1px solid #e0e0e0' }}>
                    politique de confidentialité
                  </a>
                </span>
              </Checkbox>
            </div>

            {/* Submit Button */}
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={loading}
              style={{
                width: '100%',
                height: '52px',
                borderRadius: '4px',
                background: '#000000',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '20px'
              }}
            >
              Créer mon compte
            </Button>

            {/* Login Link */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666666' }}>
                Déjà un compte ?{' '}
              </span>
              <Link
                to="/login"
                style={{
                  color: '#000000',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  borderBottom: '1px solid #000000'
                }}
              >
                Se connecter
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side - Welcome Message */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.3
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '48px',
          maxWidth: '520px'
        }}>
          <h2 style={{
            fontSize: '52px',
            fontWeight: '900',
            color: '#ffffff',
            marginBottom: '24px',
            lineHeight: '1.1',
            letterSpacing: '-2px'
          }}>
            Ravi de vous voir
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#cccccc',
            lineHeight: '1.7',
            marginBottom: '48px'
          }}>
            Rejoignez des milliers d'équipes qui utilisent notre plateforme pour gérer leurs projets avec efficacité et simplicité.
          </p>

          {/* Features */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            textAlign: 'left'
          }}>
            {[
              'Gestion de projets intuitive',
              'Collaboration en temps réel',
              'Analytics et rapports détaillés'
            ].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px',
                background: '#1a1a1a',
                borderRadius: '4px',
                border: '1px solid #333333'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '4px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#000000', fontSize: '18px', fontWeight: '700' }}>✓</span>
                </div>
                <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
