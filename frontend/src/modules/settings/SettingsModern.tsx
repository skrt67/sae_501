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
        console.error('Erreur chargement settings:', error)
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
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--primary)' + '15', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} style={{ color: 'var(--primary)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
            {title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--primary)' + '15', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Icon size={18} style={{ color: 'var(--primary)' }} />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
          Paramètres
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Personnalisez votre expérience et gérez vos préférences
        </p>
      </div>

      <div style={{ maxWidth: '800px' }}>
        {/* Notifications */}
        <Section title="Notifications" icon={Bell}>
          <SettingItem
            icon={Bell}
            title="Assignation de tâche"
            description="Recevoir une notification quand une tâche vous est assignée"
          >
            <Switch
              checked={settings.notif_task_assigned}
              onChange={(checked) => updateSetting('notif_task_assigned', checked)}
              disabled={saving}
            />
          </SettingItem>

          <SettingItem
            icon={Clock}
            title="Échéances proches"
            description="Rappel 24h avant la date limite d'une tâche"
          >
            <Switch
              checked={settings.notif_due_soon}
              onChange={(checked) => updateSetting('notif_due_soon', checked)}
              disabled={saving}
            />
          </SettingItem>

          <SettingItem
            icon={Mail}
            title="Notifications par email"
            description="Recevoir des emails pour les mises à jour critiques"
          >
            <Switch
              checked={settings.notif_email_critical}
              onChange={(checked) => updateSetting('notif_email_critical', checked)}
              disabled={saving}
            />
          </SettingItem>

          <SettingItem
            icon={Eye}
            title="Mentions"
            description="Être notifié quand quelqu'un vous mentionne"
          >
            <Switch
              checked={settings.notif_mentions}
              onChange={(checked) => updateSetting('notif_mentions', checked)}
              disabled={saving}
            />
          </SettingItem>
        </Section>

        {/* Apparence */}
        <Section title="Apparence" icon={Palette}>
          <SettingItem
            icon={appTheme === 'dark' ? Moon : Sun}
            title="Thème"
            description="Basculer entre le mode clair et sombre"
          >
            <Switch
              checked={appTheme === 'dark'}
              onChange={toggleTheme}
              checkedChildren={<Moon size={14} />}
              unCheckedChildren={<Sun size={14} />}
            />
          </SettingItem>

          <SettingItem
            icon={Zap}
            title="Mode compact"
            description="Réduire l'espacement pour afficher plus de contenu"
          >
            <Switch
              checked={settings.compact_mode}
              onChange={(checked) => updateSetting('compact_mode', checked)}
              disabled={saving}
            />
          </SettingItem>

          <SettingItem
            icon={Volume2}
            title="Sons"
            description="Activer les sons pour les notifications"
          >
            <Switch
              checked={settings.sound_enabled}
              onChange={(checked) => updateSetting('sound_enabled', checked)}
              disabled={saving}
            />
          </SettingItem>
        </Section>

        {/* Préférences */}
        <Section title="Préférences" icon={Globe}>
          <SettingItem
            icon={Globe}
            title="Fuseau horaire"
            description="Utilisé pour l'affichage des dates et échéances"
          >
            <Select
              value={settings.timezone}
              onChange={(value) => updateSetting('timezone', value)}
              style={{ width: '200px' }}
              options={timezones}
              disabled={saving}
              showSearch
            />
          </SettingItem>

          <SettingItem
            icon={Globe}
            title="Langue"
            description="Langue de l'interface"
          >
            <Select
              value={settings.language}
              onChange={(value) => updateSetting('language', value)}
              style={{ width: '200px' }}
              options={languages}
              disabled={saving}
            />
          </SettingItem>

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

        {/* Données & Confidentialité */}
        <Section title="Données & Confidentialité" icon={Shield}>
          <div style={{ 
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--text)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
              onClick={() => message.info('Fonctionnalité à venir')}
            >
              <Download size={18} />
              <span>Exporter mes données</span>
            </button>

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'transparent',
                border: '1px solid var(--error)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                color: 'var(--error)',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--error)' + '15'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  message.warning('Fonctionnalité à venir')
                }
              }}
            >
              <Trash2 size={18} />
              <span>Supprimer mon compte</span>
            </button>
          </div>
        </Section>
      </div>
    </div>
  )
}
