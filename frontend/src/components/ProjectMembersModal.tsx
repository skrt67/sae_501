import { useState, useEffect } from 'react'
import { Modal, Select, Button, Avatar, message, Popconfirm, Tag } from 'antd'
import { Users, UserPlus, UserMinus, Crown, Shield, Mail } from 'lucide-react'
import { useAuth } from '../modules/auth/AuthContext'
import { User, Project } from '../types'

interface Member extends User {
  pivot?: {
    role: 'owner' | 'admin' | 'member'
    joined_at?: string
  }
}

interface ProjectMembersModalProps {
  visible: boolean
  onClose: () => void
  project: Project | null
  onMembersUpdated?: () => void
}

export default function ProjectMembersModal({
  visible,
  onClose,
  project,
  onMembersUpdated
}: ProjectMembersModalProps) {
  const { token, user } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    if (visible && project) {
      loadMembers()
      loadAvailableUsers()
    }
  }, [visible, project])

  const loadMembers = async () => {
    if (!project) return

    try {
      const resp = await fetch(`/api/projects/${project.id}/members`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setMembers(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (e) {
      // Erreur silencieuse
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const resp = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setAvailableUsers(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (e) {
      // Erreur silencieuse
    }
  }

  const addMember = async (userId: number) => {
    if (!project) return

    setAdding(true)
    try {
      const resp = await fetch(`/api/projects/${project.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        },
        body: JSON.stringify({ user_id: userId, role: 'member' })
      })

      if (resp.ok) {
        message.success('Membre ajouté au projet')
        loadMembers()
        onMembersUpdated?.()
      } else {
        const error = await resp.json()
        message.error(error.message || 'Erreur lors de l\'ajout')
      }
    } catch (e) {
      message.error('Erreur lors de l\'ajout du membre')
    } finally {
      setAdding(false)
    }
  }

  const removeMember = async (userId: number) => {
    if (!project) return

    try {
      const resp = await fetch(`/api/projects/${project.id}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Membre retiré du projet')
        loadMembers()
        onMembersUpdated?.()
      } else {
        message.error('Erreur lors de la suppression')
      }
    } catch (e) {
      message.error('Erreur lors de la suppression du membre')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={14} style={{ color: '#f59e0b' }} />
      case 'admin':
        return <Shield size={14} style={{ color: '#3b82f6' }} />
      default:
        return <Users size={14} style={{ color: 'var(--text-muted)' }} />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire'
      case 'admin':
        return 'Admin'
      default:
        return 'Membre'
    }
  }

  // Filtrer les utilisateurs qui ne sont pas déjà membres
  const usersToAdd = availableUsers.filter(u =>
    !members.some(m => m.id === u.id)
  )

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--primary)' + '15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Membres du projet
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
              {project?.name}
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div style={{ marginTop: '24px' }}>
        {/* Ajouter un membre */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-hover)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <UserPlus size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '15px', fontWeight: '500' }}>Ajouter un membre</span>
          </div>

          <Select
            placeholder="Sélectionner un utilisateur"
            style={{ width: '100%' }}
            size="large"
            loading={adding}
            onSelect={addMember}
            options={usersToAdd.map(user => ({
              value: user.id,
              label: (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size={24} style={{ background: 'var(--primary)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                </div>
              )
            }))}
          />
        </div>

        {/* Liste des membres */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Membres actuels ({members.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {members.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar
                    size={40}

                    style={{ background: 'var(--primary)' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Avatar>

                  <div>
                    <div style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: 'var(--text)'
                    }}>
                      {member.name}
                      {member.id === user?.id && (
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginLeft: '8px'
                        }}>
                          (Vous)
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {member.email}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    background: 'var(--bg-hover)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {getRoleIcon(member.pivot?.role || 'member')}
                    {getRoleLabel(member.pivot?.role || 'member')}
                  </div>

                  {/* Bouton supprimer (sauf pour le propriétaire et soi-même) */}
                  {member.pivot?.role !== 'owner' && member.id !== user?.id && (
                    <Popconfirm
                      title="Retirer ce membre ?"
                      description="Cette action est irréversible"
                      onConfirm={() => removeMember(member.id)}
                      okText="Retirer"
                      cancelText="Annuler"
                    >
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<UserMinus size={14} />}
                      />
                    </Popconfirm>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}
