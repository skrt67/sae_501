import React, { useEffect, useState } from 'react'
import { Form, Input, Button, message } from 'antd'
import { useAuth } from '../auth/AuthContext'
import { User, Mail, Lock, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ProfileModern() {
  const { token, user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [profileForm] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

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
      if (!resp.ok) {
        const error = await resp.json()
        console.error('Erreur:', error)
        throw new Error('Mise à jour échouée')
      }
      
      message.success('Mot de passe mis à jour')
      passwordForm.resetFields()
    } catch (e) {
      console.error('Exception:', e)
      message.error('Impossible de mettre à jour le mot de passe')
    } finally {
      setSavingPassword(false)
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '600', letterSpacing: '-0.02em', color: '#1a1a1a', margin: '0 0 8px 0' }}>
            Mon Profil
          </h1>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
            Gérez vos informations personnelles et votre sécurité
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Profile Card */}
        <div className="card" style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
            Informations personnelles
          </h2>

          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '48px',
              fontWeight: '700',
              marginBottom: '16px',
              border: '4px solid rgba(0, 0, 0, 0.06)'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>

          {/* Form */}
          <Form form={profileForm} layout="vertical" onFinish={onFinishProfile}>
            <Form.Item
              label="Nom"
              name="name"
              rules={[{ required: true, message: 'Le nom est requis' }]}
            >
              <Input
                prefix={<User size={16} style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
                placeholder="Votre nom"
                disabled={savingProfile}
                style={{ height: '44px', borderRadius: '8px' }}
              />
            </Form.Item>

            <Form.Item label="Email" name="email">
              <Input
                prefix={<Mail size={16} style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
                disabled
                style={{ height: '44px', borderRadius: '8px' }}
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
                borderRadius: '8px',
                background: '#000000',
                borderColor: '#000000',
                fontWeight: 500
              }}
            >
              Enregistrer
            </Button>
          </Form>
        </div>

        {/* Security Card */}
        <div className="card" style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '32px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>
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
                prefix={<Lock size={16} style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
                placeholder="••••••••"
                disabled={savingPassword}
                style={{ height: '44px', borderRadius: '8px' }}
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
                prefix={<Lock size={16} style={{ color: 'rgba(0, 0, 0, 0.65)' }} />}
                placeholder="••••••••"
                disabled={savingPassword}
                style={{ height: '44px', borderRadius: '8px' }}
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
                borderRadius: '8px',
                background: '#000000',
                borderColor: '#000000',
                fontWeight: 500
              }}
            >
              Mettre à jour le mot de passe
            </Button>
          </Form>
        </div>
      </div>
      </div>
    </div>
  )
}
