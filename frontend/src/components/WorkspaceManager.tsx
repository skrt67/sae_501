import React, { useState, useEffect } from 'react'
import { Modal, Button, Avatar, message, Popconfirm, Badge } from 'antd'
import { Users, LogOut, Crown, Shield, UserCheck } from 'lucide-react'
import { useAuth } from '../modules/auth/AuthContext'
import { Workspace } from '../types'

interface WorkspaceWithPivot extends Workspace {
  pivot?: {
    role: 'owner' | 'admin' | 'member'
  }
  members_count?: number
}

interface WorkspaceManagerProps {
  visible: boolean
  onClose: () => void
  onWorkspacesUpdated?: () => void
}

export default function WorkspaceManager({
  visible,
  onClose,
  onWorkspacesUpdated
}: WorkspaceManagerProps) {
  const { token, user } = useAuth()
  const [workspaces, setWorkspaces] = useState<WorkspaceWithPivot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (visible) {
      loadWorkspaces()
    }
  }, [visible])

  const loadWorkspaces = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setWorkspaces(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (e) {
      console.error('Erreur chargement workspaces:', e)
    } finally {
      setLoading(false)
    }
  }

  const leaveWorkspace = async (workspaceId: number) => {
    try {
      const resp = await fetch(`/api/workspaces/${workspaceId}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })

      if (resp.ok) {
        message.success('Vous avez quitté l\'équipe')
        loadWorkspaces()
        onWorkspacesUpdated?.()
      } else {
        const error = await resp.json()
        message.error(error.message || 'Erreur lors de la sortie')
      }
    } catch (e) {
      message.error('Erreur lors de la sortie de l\'équipe')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown size={16} style={{ color: '#f59e0b' }} />
      case 'admin':
        return <Shield size={16} style={{ color: '#3b82f6' }} />
      default:
        return <UserCheck size={16} style={{ color: 'var(--success)' }} />
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propriétaire'
      case 'admin':
        return 'Administrateur'
      default:
        return 'Membre'
    }
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--success)' + '15', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Users size={20} style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Mes Équipes
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>
              Gérez votre appartenance aux équipes
            </p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      loading={loading}
    >
      <div style={{ marginTop: '24px' }}>
        {workspaces.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px 24px',
            color: 'var(--text-muted)' 
          }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p>Vous ne faites partie d'aucune équipe</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workspaces.map((workspace) => {
              const userRole = workspace.pivot?.role || 'member'
              const isOwner = userRole === 'owner'
              
              return (
                <div 
                  key={workspace.id}
                  style={{ 
                    padding: '20px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Avatar de l'équipe */}
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        background: 'var(--success)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                        {workspace.name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          marginBottom: '4px'
                        }}>
                          <h4 style={{ 
                            margin: 0, 
                            fontSize: '16px', 
                            fontWeight: '600',
                            color: 'var(--text)'
                          }}>
                            {workspace.name}
                          </h4>
                          
                          <Badge 
                            count={getRoleLabel(userRole)}
                            style={{ 
                              backgroundColor: userRole === 'owner' ? '#f59e0b' : 
                                             userRole === 'admin' ? '#3b82f6' : 'var(--success)',
                              fontSize: '11px'
                            }}
                          />
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontSize: '13px',
                          color: 'var(--text-muted)'
                        }}>
                          {getRoleIcon(userRole)}
                          <span>
                            {workspace.members_count || 0} membre{(workspace.members_count || 0) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!isOwner && (
                        <Popconfirm
                          title="Quitter cette équipe ?"
                          description="Vous perdrez l'accès à tous les projets de cette équipe"
                          onConfirm={() => leaveWorkspace(workspace.id)}
                          okText="Quitter"
                          cancelText="Annuler"
                          okButtonProps={{ danger: true }}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<LogOut size={16} />}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '6px' 
                            }}
                          >
                            Quitter
                          </Button>
                        </Popconfirm>
                      )}
                      
                      {isOwner && (
                        <div style={{ 
                          padding: '6px 12px',
                          background: 'var(--warning)' + '15',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12px',
                          color: 'var(--warning)',
                          fontWeight: '500'
                        }}>
                          Propriétaire
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
