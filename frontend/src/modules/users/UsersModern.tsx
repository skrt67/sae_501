import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, message, Select, Tag } from 'antd'
import { Plus, Mail, UserPlus, Trash2, Shield, Crown, User as UserIcon } from 'lucide-react'

const { Option } = Select

export default function UsersModern() {
  const { token, user } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (currentWorkspace) {
      loadUsers()
    }
  }, [token, navigate, currentWorkspace])

  const loadUsers = async () => {
    if (!currentWorkspace) return
    
    setLoading(true)
    try {
      // Charger uniquement les membres du workspace actuel
      const resp = await fetch(`/api/workspaces/${currentWorkspace.id}/members`, { 
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
      })
      if (!resp.ok) throw new Error('Erreur de chargement')
      const data = await resp.json()
      setUsers(Array.isArray(data) ? data : (data.data || []))
    } catch (e) {
      message.error('Impossible de charger les membres')
    } finally {
      setLoading(false)
    }
  }

  const openInviteModal = () => {
    // Rediriger vers la page d'invitations
    navigate('/invitations')
  }

  const handleInvite = async (values) => {
    setInviting(true)
    try {
      const resp = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          role: values.role || 'member'
        })
      })
      
      if (!resp.ok) {
        const error = await resp.json().catch(() => ({}))
        throw new Error(error.message || 'Erreur lors de l\'invitation')
      }
      
      message.success('Invitation envoyée avec succès')
      setInviteModalOpen(false)
      form.resetFields()
      loadUsers()
    } catch (e) {
      message.error(e.message || 'Erreur lors de l\'invitation')
    } finally {
      setInviting(false)
    }
  }

  const deleteUser = async (userId) => {
    if (userId === user?.id) {
      message.warning('Vous ne pouvez pas vous supprimer vous-même')
      return
    }

    if (!confirm('Supprimer cet utilisateur ?')) return
    
    try {
      const resp = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!resp.ok) throw new Error('Erreur')
      
      message.success('Utilisateur supprimé')
      loadUsers()
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  const getRoleInfo = (role) => {
    switch (role) {
      case 'admin':
        return { icon: Crown, color: '#f5576c', label: 'Admin' }
      case 'manager':
        return { icon: Shield, color: '#667eea', label: 'Manager' }
      default:
        return { icon: UserIcon, color: '#6f767e', label: 'Membre' }
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
            Équipe
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Gérez les membres de votre équipe et leurs accès
          </p>
        </div>
        <Button 
          type="primary" 
          onClick={openInviteModal}
          icon={<UserPlus size={18} />}
          style={{ 
            background: 'var(--primary)', 
            borderColor: 'var(--primary)', 
            borderRadius: 'var(--radius-md)', 
            height: '44px', 
            padding: '0 24px', 
            fontWeight: 500,
            fontSize: '15px'
          }}
        >
          Inviter un membre
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>{users.length}</div>
        </div>
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Admins</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>
            {users.filter(u => u.role === 'admin').length}
          </div>
        </div>
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Membres</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>
            {users.filter(u => u.role !== 'admin').length}
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '100px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ width: '100%', height: '20px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
              <div style={{ width: '60%', height: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <UserIcon size={40} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
            Aucun membre
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Invitez des membres pour collaborer sur vos projets
          </p>
          <Button 
            type="primary" 
            onClick={openInviteModal}
            icon={<UserPlus size={18} />}
            style={{ 
              background: 'var(--primary)', 
              borderColor: 'var(--primary)', 
              height: '44px', 
              padding: '0 24px', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 500 
            }}
          >
            Inviter un membre
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {users.map((u) => {
            const roleInfo = getRoleInfo(u.role)
            const RoleIcon = roleInfo.icon
            const isCurrentUser = u.id === user?.id

            return (
              <div 
                key={u.id}
                className="card hover-lift"
                style={{ 
                  background: 'var(--bg-card)',
                  border: isCurrentUser ? '2px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                  {/* Avatar */}
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '50%', 
                    background: roleInfo.color + '15', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: `2px solid ${roleInfo.color}30`,
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}>
                    {u.avatar_url ? (
                      <img 
                        src={u.avatar_url.startsWith('http') ? u.avatar_url : `http://localhost:8000${u.avatar_url}`}
                        alt={u.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <RoleIcon size={24} style={{ color: roleInfo.color }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
                        {u.name}
                      </h3>
                      {isCurrentUser && (
                        <Tag color="blue" style={{ margin: 0, fontSize: '11px', padding: '2px 8px' }}>
                          Vous
                        </Tag>
                      )}
                      <Tag 
                        style={{ 
                          margin: 0, 
                          background: roleInfo.color + '15', 
                          color: roleInfo.color, 
                          border: 'none',
                          fontSize: '11px',
                          padding: '2px 8px'
                        }}
                      >
                        {roleInfo.label}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                      <Mail size={14} />
                      <span>{u.email}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {!isCurrentUser && (
                  <button
                    onClick={() => deleteUser(u.id)}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      border: 'none', 
                      background: 'transparent', 
                      borderRadius: 'var(--radius-md)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: 'var(--error)', 
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error)' + '15'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>Inviter un membre</span>}
        open={inviteModalOpen}
        onCancel={() => {
          setInviteModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleInvite} style={{ marginTop: '24px' }}>
          <Form.Item
            label="Nom complet"
            name="name"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input 
              placeholder="Jean Dupont" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'L\'email est requis' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input 
              type="email"
              placeholder="jean@exemple.com" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item
            label="Rôle"
            name="role"
            initialValue="member"
          >
            <Select style={{ height: '44px' }}>
              <Option value="member">Membre</Option>
              <Option value="manager">Manager</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button 
              onClick={() => {
                setInviteModalOpen(false)
                form.resetFields()
              }}
              style={{ height: '40px', borderRadius: 'var(--radius-md)' }}
            >
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={inviting}
              style={{ 
                height: '40px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--primary)', 
                borderColor: 'var(--primary)' 
              }}
            >
              Envoyer l'invitation
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
