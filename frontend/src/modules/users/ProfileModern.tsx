import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useAuth } from '../auth/AuthContext'
import { User, Mail, Lock, Camera, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfileModern() {
  const { token, user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (user) {
      profileForm.setFieldsValue({ name: user.name || '', email: user.email || '' })
    }
  }, [user, profileForm, token, navigate])

  const onFinishProfile = async (values) => {
    if (!token) return
    setSavingProfile(true)
    try {
      const resp = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: values.name })
      })
      if (!resp.ok) throw new Error('Mise à jour échouée')
      
      message.success('Profil mis à jour')
      await refreshUser()
    } catch (e) {
      message.error('Impossible de mettre à jour le profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const onFinishPassword = async (values) => {
    if (!token) return
    if (values.password !== values.password_confirmation) {
      message.error('Les mots de passe ne correspondent pas')
      return
    }
    setSavingPassword(true)
    try {
      const resp = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          password: values.password, 
          password_confirmation: values.password_confirmation 
        })
      })
      if (!resp.ok) throw new Error('Mise à jour échouée')
      
      message.success('Mot de passe mis à jour')
      passwordForm.resetFields()
    } catch (e) {
      message.error('Impossible de mettre à jour le mot de passe')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Vérifier que c'est une image
    if (!file.type.startsWith('image/')) {
      message.error('Veuillez sélectionner une image')
      return
    }
    
    const formData = new FormData()
    formData.append('avatar', file)
    setUploading(true)
    
    try {
      const resp = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      
      if (!resp.ok) {
        const errorData = await resp.text()
        console.error('Erreur upload:', errorData)
        throw new Error('Upload échoué')
      }
      
      const data = await resp.json()
      console.log('Réponse upload:', data)
      
      message.success('Photo mise à jour')
      
      // Attendre un peu puis recharger
      setTimeout(async () => {
        await refreshUser()
        console.log('User après refresh:', user)
      }, 500)
      
    } catch (error) {
      console.error('Erreur:', error)
      message.error('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
          Mon Profil
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px' }}>
            Informations personnelles
          </h2>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'var(--primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              border: '4px solid var(--border)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8000${user.avatar_url}?t=${Date.now()}`}
                  alt="Avatar" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                  onError={(e) => {
                    console.error('Erreur chargement image:', user.avatar_url)
                    e.target.style.display = 'none'
                  }}
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'U'
              )}
              
              <label
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '3px solid var(--bg-card)',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                onMouseEnter={(e) => !uploading && (e.currentTarget.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Camera size={18} />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {uploading ? 'Upload en cours...' : 'Cliquez sur l\'icône pour changer'}
            </p>
          </div>

          {/* Form */}
          <Form form={profileForm} layout="vertical" onFinish={onFinishProfile}>
            <Form.Item
              label="Nom"
              name="name"
              rules={[{ required: true, message: 'Le nom est requis' }]}
            >
              <Input 
                prefix={<User size={16} style={{ color: 'var(--text-muted)' }} />}
                placeholder="Votre nom" 
                disabled={savingProfile}
                style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
              />
            </Form.Item>
            
            <Form.Item label="Email" name="email">
              <Input 
                prefix={<Mail size={16} style={{ color: 'var(--text-muted)' }} />}
                disabled
                style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
              />
            </Form.Item>
            
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={savingProfile}
              icon={<Save size={16} />}
              style={{ 
                width: '100%',
                height: '44px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--primary)', 
                borderColor: 'var(--primary)',
                fontWeight: 500
              }}
            >
              Enregistrer
            </Button>
          </Form>
        </div>

        {/* Security Card */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '24px' }}>
            Sécurité
          </h2>

          <Form form={passwordForm} layout="vertical" onFinish={onFinishPassword}>
            <Form.Item
              label="Nouveau mot de passe"
              name="password"
              rules={[
                { required: true, message: 'Le mot de passe est requis' },
                { min: 8, message: 'Au moins 8 caractères' }
              ]}
            >
              <Input.Password 
                prefix={<Lock size={16} style={{ color: 'var(--text-muted)' }} />}
                placeholder="••••••••" 
                disabled={savingPassword}
                style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
              />
            </Form.Item>
            
            <Form.Item
              label="Confirmer le mot de passe"
              name="password_confirmation"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirmation requise' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'))
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<Lock size={16} style={{ color: 'var(--text-muted)' }} />}
                placeholder="••••••••" 
                disabled={savingPassword}
                style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
              />
            </Form.Item>
            
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={savingPassword}
              icon={<Save size={16} />}
              style={{ 
                width: '100%',
                height: '44px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--primary)', 
                borderColor: 'var(--primary)',
                fontWeight: 500
              }}
            >
              Mettre à jour le mot de passe
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}
