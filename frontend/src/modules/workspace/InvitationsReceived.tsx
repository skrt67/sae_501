import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button, message } from 'antd'
import { Mail, Check, X, Clock } from 'lucide-react'

export default function InvitationsReceived() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (user?.email) {
      loadInvitations()
    }
  }, [token, navigate, user])

  const loadInvitations = async () => {
    if (!user?.email) {
      console.log('Pas d\'email utilisateur, attente...')
      setLoading(false)
      return
    }
    
    setLoading(true)
    try {
      console.log('Chargement invitations pour:', user.email)
      // Chercher toutes les invitations pour mon email
      const resp = await fetch('/api/invitations/received', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      
      console.log('Réponse API invitations:', resp.status, resp.statusText)
      
      if (resp.ok) {
        const data = await resp.json()
        console.log('Données invitations reçues:', data)
        setInvitations(Array.isArray(data) ? data : (data.data || []))
      } else {
        console.error('Erreur API invitations reçues:', resp.status, await resp.text())
        setInvitations([])
      }
    } catch (error) {
      console.error('Erreur:', error)
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (invitation) => {
    setProcessing(prev => ({ ...prev, [invitation.id]: true }))
    try {
      const resp = await fetch(`/api/invitations/${invitation.token}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Invitation acceptée ! Vous avez rejoint l\'équipe.')
        loadInvitations()
        // Recharger les workspaces
        window.location.reload()
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

  const handleReject = async (invitation) => {
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
          Invitations Reçues
        </h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>
          Les équipes qui vous ont invité à les rejoindre
        </p>
      </div>

      {/* Invitations List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
          </div>
        ) : invitations.length === 0 ? (
          <div className="card" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '48px',
            textAlign: 'center'
          }}>
            <Mail size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: '0 0 8px 0' }}>
              Aucune invitation
            </h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Vous n'avez pas d'invitations en attente
            </p>
          </div>
        ) : (
          invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="card hover-lift"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--primary)' + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={28} style={{ color: 'var(--primary)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                      Invitation à rejoindre "{invitation.workspace?.name}"
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Invité par {invitation.inviter?.name} comme {invitation.role === 'admin' ? 'Administrateur' : 'Membre'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      Reçue le {new Date(invitation.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {invitation.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                      danger
                      icon={<X size={16} />}
                      onClick={() => handleReject(invitation)}
                      loading={processing[invitation.id]}
                      style={{ borderRadius: 'var(--radius-md)' }}
                    >
                      Refuser
                    </Button>
                    <Button
                      type="primary"
                      icon={<Check size={16} />}
                      onClick={() => handleAccept(invitation)}
                      loading={processing[invitation.id]}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary)',
                        borderColor: 'var(--primary)'
                      }}
                    >
                      Accepter
                    </Button>
                  </div>
                )}
                
                {invitation.status === 'accepted' && (
                  <div style={{ 
                    padding: '8px 16px', 
                    background: 'var(--success)' + '15', 
                    color: 'var(--success)', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ✓ Acceptée
                  </div>
                )}
                
                {invitation.status === 'rejected' && (
                  <div style={{ 
                    padding: '8px 16px', 
                    background: 'var(--error)' + '15', 
                    color: 'var(--error)', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    ✗ Refusée
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
