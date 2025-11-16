import React, { useState } from 'react'
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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Left Side - Form */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '48px'
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: '480px',
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Title */}
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1a1d1f', 
            marginBottom: '8px' 
          }}>
            Bonjour, ami !
          </h1>
          <p style={{ 
            fontSize: '15px', 
            color: '#6f767e', 
            marginBottom: '40px' 
          }}>
            Créez votre compte pour commencer
          </p>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <User size={20} style={{ color: 'white' }} />
                </div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom"
                  disabled={loading}
                  style={{
                    height: '64px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    paddingLeft: '76px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Mail size={20} style={{ color: 'white' }} />
                </div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-mail"
                  disabled={loading}
                  style={{
                    height: '64px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    paddingLeft: '76px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1
                }}>
                  <Lock size={20} style={{ color: 'white' }} />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mot de passe"
                  disabled={loading}
                  style={{
                    height: '64px',
                    borderRadius: '16px',
                    border: 'none',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)',
                    paddingLeft: '76px',
                    paddingRight: '52px',
                    fontSize: '15px',
                    fontWeight: '500'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#667eea',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 1
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div style={{ marginBottom: '28px' }}>
              <Checkbox 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              >
                <span style={{ fontSize: '13px', color: '#6f767e' }}>
                  J'ai lu et j'accepte les{' '}
                  <a href="#" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                    Conditions d'utilisation
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
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              Créer mon compte
            </Button>

            {/* Login Link */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <span style={{ fontSize: '14px', color: '#9a9fa5' }}>
                Déjà un compte ?{' '}
              </span>
              <Link 
                to="/login"
                style={{
                  color: '#667eea',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none'
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Waves */}
        <svg 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          viewBox="0 0 1000 1000" 
          preserveAspectRatio="none"
        >
          <path 
            d="M0,300 Q250,200 500,300 T1000,300 L1000,0 L0,0 Z" 
            fill="rgba(255, 255, 255, 0.1)"
          />
          <path 
            d="M0,1000 Q250,900 500,1000 T1000,1000 L1000,700 L0,700 Z" 
            fill="rgba(255, 255, 255, 0.1)"
          />
        </svg>

        {/* Content */}
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          textAlign: 'center',
          padding: '48px',
          maxWidth: '500px'
        }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: '700', 
            color: 'white', 
            marginBottom: '24px',
            lineHeight: '1.2'
          }}>
            Ravi de vous voir !
          </h2>
          <p style={{ 
            fontSize: '18px', 
            color: 'rgba(255, 255, 255, 0.9)', 
            lineHeight: '1.6',
            marginBottom: '32px'
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
                gap: '12px',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ color: '#667eea', fontSize: '16px', fontWeight: '700' }}>✓</span>
                </div>
                <span style={{ fontSize: '16px', color: 'white', fontWeight: '500' }}>
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
