import React, { useEffect, useState } from 'react'
import { Switch, Select, message } from 'antd'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { 
  Bell, Moon, Sun, Globe, Mail, Clock, 
  Shield, Eye, Database, Trash2, Download,
  Palette, Zap, Volume2
} from 'lucide-react'

const timezones = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris (France)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
]

const languages = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
]

export default function SettingsModern() {
  const { token, theme: appTheme, toggleTheme } = useAuth()
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    notif_task_assigned: true,
    notif_due_soon: true,
    notif_email_critical: false,
    notif_mentions: true,
    notif_comments: true,
    theme: 'light',
    timezone: 'Europe/Paris',
    language: 'fr',
    sound_enabled: true,
    auto_save: true,
    compact_mode: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchSettings = async () => {
      try {
        const resp = await fetch('/api/user/settings', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        })
        if (resp.ok) {
          const data = await resp.json()
          setSettings(prev => ({ ...prev, ...data }))
        }
      } catch (error) {
        // Erreur silencieuse
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [token, navigate])

  const updateSetting = async (key, value) => {
    setSaving(true)
    try {
      const newSettings = { ...settings, [key]: value }
      const resp = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newSettings)
      })
      
      if (resp.ok) {
        setSettings(newSettings)
        message.success('Paramètre mis à jour')
        
        if (key === 'theme') {
          toggleTheme()
        }
      } else {
        throw new Error('Erreur')
      }
    } catch (error) {
      message.error('Impossible de mettre à jour')
    } finally {
      setSaving(false)
    }
  }

  const SettingItem = ({ icon: Icon, title, description, children }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '20px',
      background: '#ffffff',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderRadius: '8px',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.12)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} style={{ color: '#000000' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
            {description}
          </div>
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {children}
      </div>
    </div>
  )

  const Section = ({ title, icon: Icon, children }) => (
    <div style={{ marginBottom: '48px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={18} style={{ color: '#000000' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
          {title}
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
      </div>
    </div>
  )

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '600', letterSpacing: '-0.02em', color: '#1a1a1a', margin: '0 0 8px 0' }}>
            Paramètres
          </h1>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
            Personnalisez votre expérience et gérez vos préférences
          </p>
        </div>

        <div style={{ maxWidth: '800px' }}>
        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <SettingItem
            icon={Bell}
            title="Notifications dans l'application"
            description="Afficher les notifications dans le centre de notifications"
          >
            <Switch
              checked={settings.notif_task_assigned}
              onChange={(checked) => updateSetting('notif_task_assigned', checked)}
              disabled={saving}
            />
          </SettingItem>

          <SettingItem
            icon={Clock}
            title="Alertes d'échéance"
            description="Être alerté des tâches arrivant à échéance"
          >
            <Switch
              checked={settings.notif_due_soon}
              onChange={(checked) => updateSetting('notif_due_soon', checked)}
              disabled={saving}
            />
          </SettingItem>
        </Section>

        {/* Préférences */}
        <Section title="Préférences" icon={Globe}>
          <SettingItem
            icon={Database}
            title="Sauvegarde automatique"
            description="Enregistrer automatiquement vos modifications"
          >
            <Switch
              checked={settings.auto_save}
              onChange={(checked) => updateSetting('auto_save', checked)}
              disabled={saving}
            />
          </SettingItem>
        </Section>
        </div>
      </div>
    </div>
  )
}
