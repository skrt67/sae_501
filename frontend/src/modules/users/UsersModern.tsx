import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button, message, Tag, Popconfirm, Select, Modal, Form, Input } from 'antd'
import { Mail, UserPlus, Trash2, User as UserIcon, FolderKanban, Crown, Shield } from 'lucide-react'

interface Project {
  id: number
  name: string
  users?: User[]
}

interface User {
  id: number
  name: string
  email: string
  avatar_url?: string
  role?: string
  pivot?: {
    role: 'owner' | 'member'
  }
}

export default function UsersModern() {
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadProjects()
  }, [token, navigate])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const resp = await fetch('/api/projects', { 
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
      })
      
      if (!resp.ok) {
        throw new Error('Erreur de chargement')
      }
      
      const data = await resp.json()
      const projectsList = Array.isArray(data) ? data : (data.data || [])
      setProjects(projectsList)
      
      // Sélectionner le premier projet par défaut
      if (projectsList.length > 0 && !selectedProject) {
        setSelectedProject(projectsList[0].id)
        loadProjectMembers(projectsList[0].id)
      }
    } catch (e: any) {
      message.error('Impossible de charger les projets')
    } finally {
      setLoading(false)
    }
  }

  const loadProjectMembers = async (projectId: number) => {
    try {
      const resp = await fetch(`/api/projects/${projectId}/members`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      
      if (!resp.ok) {
        throw new Error('Erreur de chargement')
      }
      
      const members = await resp.json()
      
      // Mettre à jour le projet avec ses membres
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, users: Array.isArray(members) ? members : (members.data || []) } : p
      ))
    } catch (e: any) {
      message.error('Erreur chargement membres')
    }
  }

  const handleProjectChange = (projectId: number) => {
    setSelectedProject(projectId)
    const project = projects.find(p => p.id === projectId)
    if (!project?.users) {
      loadProjectMembers(projectId)
    }
  }

  const openInviteModal = () => {
    if (!selectedProject) {
      message.warning('Veuillez sélectionner un projet')
      return
    }
    setInviteModalOpen(true)
  }

  const removeMember = async (userId: number) => {
    if (!selectedProject) return
    
    try {
      const resp = await fetch(`/api/projects/${selectedProject}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!resp.ok) throw new Error('Erreur')
      
      message.success('Membre retiré du projet')
      loadProjectMembers(selectedProject)
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  const getRoleInfo = (role?: string) => {
    switch (role) {
      case 'owner':
        return { icon: Crown, color: '#f5576c', label: 'Propriétaire' }
      case 'admin':
        return { icon: Shield, color: '#667eea', label: 'Admin' }
      default:
        return { icon: UserIcon, color: '#6f767e', label: 'Membre' }
    }
  }

  const currentProject = projects.find(p => p.id === selectedProject)
  const members = currentProject?.users || []
  const isOwner = members.find(m => m.id === user?.id)?.pivot?.role === 'owner'

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
            Mon Équipe
          </h1>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '18px' }}>
            Gérez les membres de vos projets
          </p>
        </div>

        {/* Project Selector */}
        <div style={{ 
          background: '#ffffff', 
          border: '1px solid rgba(0, 0, 0, 0.06)', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
              <FolderKanban size={20} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
              <Select
                value={selectedProject}
                onChange={handleProjectChange}
                style={{ flex: 1, minWidth: '250px' }}
                size="large"
                placeholder="Sélectionner un projet"
              >
                {projects.map(p => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            
            <Button
              type="primary"
              onClick={openInviteModal}
              icon={<UserPlus size={18} />}
              disabled={!selectedProject}
              style={{
                background: '#000000',
                borderColor: '#000000',
                borderRadius: '8px',
                height: '44px',
                padding: '0 24px',
                fontWeight: 500,
                fontSize: '15px'
              }}
            >
              Inviter au projet
            </Button>
          </div>
        </div>

        {/* Stats */}
        {selectedProject && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            <div style={{ padding: '24px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Membres</div>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#1a1a1a' }}>{members.length}</div>
            </div>
            <div style={{ padding: '24px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Propriétaires</div>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#1a1a1a' }}>
                {members.filter(m => m.pivot?.role === 'owner').length}
              </div>
            </div>
            <div style={{ padding: '24px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
              <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Membres</div>
              <div style={{ fontSize: '32px', fontWeight: '600', color: '#1a1a1a' }}>
                {members.filter(m => m.pivot?.role === 'member').length}
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {!selectedProject ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <FolderKanban size={40} style={{ color: '#1a1a1a' }} />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
              Aucun projet sélectionné
            </h3>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: '32px', fontSize: '16px' }}>
              Sélectionnez un projet pour voir ses membres
            </p>
          </div>
        ) : loading ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '100px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ width: '100%', height: '20px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '60%', height: '16px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <UserIcon size={40} style={{ color: '#1a1a1a' }} />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
              Aucun membre
            </h3>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: '32px', fontSize: '16px' }}>
              Invitez des membres pour collaborer sur ce projet
            </p>
            <Button
              type="primary"
              onClick={openInviteModal}
              icon={<UserPlus size={18} />}
              style={{
                background: '#000000',
                borderColor: '#000000',
                height: '48px',
                padding: '0 32px',
                borderRadius: '8px',
                fontWeight: 500,
                fontSize: '16px'
              }}
            >
              Inviter un membre
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {members.map((member) => {
              const roleInfo = getRoleInfo(member.pivot?.role)
              const RoleIcon = roleInfo.icon
              const isCurrentUser = member.id === user?.id
              const canRemove = isOwner && !isCurrentUser && member.pivot?.role !== 'owner'

              return (
                <div
                  key={member.id}
                  style={{
                    background: '#ffffff',
                    border: isCurrentUser ? '2px solid #000000' : '1px solid rgba(0, 0, 0, 0.06)',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
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
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url.startsWith('http') ? member.avatar_url : `http://localhost:8005${member.avatar_url}`}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <RoleIcon size={24} style={{ color: roleInfo.color }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>
                          {member.name}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(0, 0, 0, 0.65)', fontSize: '14px' }}>
                        <Mail size={14} />
                        <span>{member.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canRemove && (
                    <Popconfirm
                      title="Retirer ce membre du projet ?"
                      description="Cette action est irréversible"
                      onConfirm={() => removeMember(member.id)}
                      okText="Retirer"
                      cancelText="Annuler"
                      okButtonProps={{ danger: true }}
                    >
                      <button
                        style={{
                          width: '40px',
                          height: '40px',
                          border: 'none',
                          background: 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ff4d4f',
                          transition: 'all 0.2s',
                          flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 size={18} />
                      </button>
                    </Popconfirm>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Invite Modal - Redirect to project page */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>Inviter au projet</span>}
        open={inviteModalOpen}
        onCancel={() => setInviteModalOpen(false)}
        footer={null}
        width={500}
      >
        <div style={{ padding: '24px 0' }}>
          <p style={{ marginBottom: '24px', color: 'rgba(0, 0, 0, 0.65)' }}>
            Pour inviter quelqu'un à ce projet, utilisez le bouton d'invitation sur la page Projets.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={() => setInviteModalOpen(false)}
              style={{ flex: 1 }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setInviteModalOpen(false)
                navigate('/projects')
              }}
              style={{ flex: 1, background: '#000000', borderColor: '#000000' }}
            >
              Aller aux Projets
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
