import { useEffect, useState } from 'react'
import { useAuth } from '../modules/auth/AuthContext'
import { Badge, Drawer, Empty, Button, message, Tabs } from 'antd'
import { Bell, Check, Trash2, Clock, UserPlus, AlertCircle, Mail, X, CheckCircle } from 'lucide-react'
import { Notification, Invitation, ProcessingState } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/fr'

dayjs.extend(relativeTime)
dayjs.locale('fr')

export default function NotificationCenter() {
  const { token, user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState<ProcessingState>({})

  useEffect(() => {
    if (token) {
      loadNotifications()
      loadInvitations()
      // Poll every 30 seconds
      const interval = setInterval(() => {
        loadNotifications()
        loadInvitations()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [token])

  const loadNotifications = async () => {
    if (!token) return
    
    try {
      const resp = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setNotifications(Array.isArray(data) ? data : (data.data || []))
      } else if (resp.status === 404) {
        // API pas encore implémentée, ignorer silencieusement
        setNotifications([])
      }
    } catch (e) {
      // Silent fail - API pas encore disponible
      setNotifications([])
    }
  }

  const loadInvitations = async () => {
    if (!token || !user?.email) return
    
    try {
      const resp = await fetch('/api/invitations/received', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        console.log('📧 Invitations reçues:', data)
        // Filtrer uniquement les invitations en attente
        const pendingInvitations = (Array.isArray(data) ? data : (data.data || []))
          .filter(inv => inv.status === 'pending')
        console.log('📧 Invitations en attente:', pendingInvitations)
        setInvitations(pendingInvitations)
      } else {
        console.error('❌ Erreur invitations:', resp.status, await resp.text())
      }
    } catch (e) {
      console.error('❌ Erreur chargement invitations:', e)
      setInvitations([])
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const resp = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resp.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      }
    } catch (e) {
      // Silent fail
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resp.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
      }
    } catch (e) {
      // Silent fail
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (id: number) => {
    try {
      const resp = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (resp.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } catch (e) {
      // Silent fail
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline':
        return <Clock size={18} style={{ color: '#f5576c' }} />
      case 'assignment':
        return <UserPlus size={18} style={{ color: '#667eea' }} />
      case 'mention':
        return <AlertCircle size={18} style={{ color: '#11998e' }} />
      default:
        return <Bell size={18} style={{ color: 'var(--text-muted)' }} />
    }
  }

  const handleAcceptInvitation = async (invitation: Invitation) => {
    setProcessing(prev => ({ ...prev, [invitation.id]: true }))
    try {
      const resp = await fetch(`/api/invitations/${invitation.token}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Invitation acceptée ! Vous avez rejoint l\'équipe.')
        loadInvitations()
        // Recharger la page pour mettre à jour les workspaces
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const error = await resp.json()
        message.error(error.message || 'Erreur lors de l\'acceptation')
      }
    } catch (error) {
      message.error('Erreur lors de l\'acceptation')
    } finally {
      setProcessing(prev => ({ ...prev, [invitation.id]: false }))
    }
  }

  const handleRejectInvitation = async (invitation: Invitation) => {
    setProcessing(prev => ({ ...prev, [invitation.id]: true }))
    try {
      const resp = await fetch(`/api/invitations/${invitation.token}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Invitation refusée')
        loadInvitations()
      } else {
        message.error('Erreur lors du refus')
      }
    } catch (error) {
      message.error('Erreur lors du refus')
    } finally {
      setProcessing(prev => ({ ...prev, [invitation.id]: false }))
    }
  }

  const unreadCount = notifications.filter(n => !n.read_at).length + invitations.length

  return (
    <>
      <button
        onClick={() => setDrawerVisible(true)}
        style={{
          position: 'relative',
          width: '40px',
          height: '40px',
          border: 'none',
          background: 'transparent',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Badge count={unreadCount} size="small">
          <Bell size={20} style={{ color: 'var(--text)' }} />
        </Badge>
      </button>

      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '18px', fontWeight: '600' }}>Notifications</span>
            {unreadCount > 0 && (
              <Button 
                type="text" 
                size="small" 
                onClick={markAllAsRead}
                loading={loading}
              >
                Tout marquer comme lu
              </Button>
            )}
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={400}
      >
        {notifications.length === 0 && invitations.length === 0 ? (
          <Empty 
            description="Aucune notification" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Invitations en premier */}
            {invitations.map((invitation) => (
              <div 
                key={`invitation-${invitation.id}`}
                style={{
                  padding: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--primary)' + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={18} style={{ color: 'var(--primary)' }} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      color: 'var(--text)', 
                      marginBottom: '4px'
                    }}>
                      Invitation à rejoindre {invitation.workspace_name}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-muted)', 
                      marginBottom: '12px'
                    }}>
                      De {invitation.inviter_name}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        type="primary"
                        size="small"
                        loading={processing[invitation.id]}
                        onClick={() => handleAcceptInvitation(invitation)}
                      >
                        Accepter
                      </Button>
                      <Button
                        size="small"
                        loading={processing[invitation.id]}
                        onClick={() => handleRejectInvitation(invitation)}
                      >
                        Refuser
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Notifications */}
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => !notif.read_at && markAsRead(notif.id)}
                style={{
                  padding: '12px',
                  background: notif.read_at ? 'var(--bg-card)' : 'var(--bg-hover)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: 'var(--radius-sm)', 
                    background: 'var(--bg-hover)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {getIcon(notif.type)}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: notif.read_at ? '400' : '600', 
                      color: 'var(--text)', 
                      marginBottom: '4px',
                      lineHeight: '1.4'
                    }}>
                      {notif.title}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-muted)', 
                      marginBottom: '8px',
                      lineHeight: '1.4'
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-subtle)' }}>
                      {dayjs(notif.created_at).fromNow()}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteNotification(notif.id)
                    }}
                    style={{
                      width: '28px',
                      height: '28px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-muted)',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--error)' + '15'
                      e.currentTarget.style.color = 'var(--error)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Drawer>
    </>
  )
}
