import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import { Button, Input, message, Select, Modal } from 'antd'
import { Mail, UserPlus, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react'

const { Option } = Select

export default function Invitations() {
  const { token } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (currentWorkspace) {
      loadInvitations()
    }
  }, [token, currentWorkspace, navigate])

  const loadInvitations = async () => {
    if (!currentWorkspace) return
    
    setLoading(true)
    try {
      const resp = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setInvitations(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async () => {
    if (!email) {
      message.warning('Veuillez entrer une adresse email')
      return
    }

    setSending(true)
    try {
      const resp = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ email, role })
      })

      if (resp.ok) {
        message.success('Invitation envoyée !')
        setModalVisible(false)
        setEmail('')
        setRole('member')
        loadInvitations()
      } else {
        console.error('Erreur API:', resp.status, resp.statusText)
        try {
          const error = await resp.json()
          console.error('Détails erreur API:', error)
          message.error(error.message || 'Erreur lors de l\'envoi')
        } catch (e) {
          console.error('Erreur parsing JSON:', e)
          message.error(`Erreur serveur (${resp.status})`)
        }
      }
    } catch (error) {
      message.error('Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setSending(false)
    }
  }

  const handleCancel = async (invitationId) => {
    try {
      const resp = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Invitation annulée')
        loadInvitations()
      }
    } catch (error) {
      message.error('Erreur lors de l\'annulation')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} style={{ color: '#f5a623' }} />
      case 'accepted': return <CheckCircle size={16} style={{ color: '#11998e' }} />
      case 'rejected': return <XCircle size={16} style={{ color: '#f5576c' }} />
      default: return null
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'accepted': return 'Acceptée'
      case 'rejected': return 'Refusée'
      default: return status
    }
  }

  if (!currentWorkspace) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Aucun workspace sélectionné</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
            Invitations
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Invitez des membres à rejoindre {currentWorkspace.name}
          </p>
        </div>
        <Button
          type="primary"
          icon={<UserPlus size={18} />}
          onClick={() => setModalVisible(true)}
          style={{
            height: '48px',
            padding: '0 24px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)',
            borderColor: 'var(--primary)',
            fontSize: '15px',
            fontWeight: '600'
          }}
        >
          Inviter un membre
        </Button>
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
              Commencez par inviter des membres à rejoindre votre équipe
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
                padding: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary)' + '15',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Mail size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                    {invitation.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <span>Rôle: {invitation.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusIcon(invitation.status)}
                      {getStatusText(invitation.status)}
                    </div>
                  </div>
                </div>
              </div>
              {invitation.status === 'pending' && (
                <Button
                  danger
                  icon={<Trash2 size={16} />}
                  onClick={() => handleCancel(invitation.id)}
                  style={{ borderRadius: 'var(--radius-md)' }}
                >
                  Annuler
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Invitation */}
      <Modal
        title="Inviter un membre"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: '24px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
              Adresse email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="membre@example.com"
              prefix={<Mail size={18} style={{ color: 'var(--text-muted)' }} />}
              style={{ height: '48px', borderRadius: 'var(--radius-md)' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>
              Rôle
            </label>
            <Select
              value={role}
              onChange={setRole}
              style={{ width: '100%', height: '48px' }}
            >
              <Option value="member">Membre</Option>
              <Option value="admin">Administrateur</Option>
            </Select>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => setModalVisible(false)}
              style={{ flex: 1, height: '48px', borderRadius: 'var(--radius-md)' }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              onClick={handleInvite}
              loading={sending}
              style={{
                flex: 1,
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                borderColor: 'var(--primary)'
              }}
            >
              Envoyer l'invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
