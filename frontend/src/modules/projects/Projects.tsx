import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../hooks'
import { Button, Modal, Form, Input, message } from 'antd'
import { Plus, Folder, Users, Calendar, Trash2, Edit, Mail } from 'lucide-react'
import ProjectInviteModal from '../../components/ProjectInviteModal'

export default function Projects() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { projects, loading, refetch } = useProjects()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editProject, setEditProject] = useState<any | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [form] = Form.useForm()

  if (!token) {
    navigate('/login')
    return null
  }

  const openCreateModal = () => {
    setEditProject(null)
    form.resetFields()
    setModalOpen(true)
  }

  const openEditModal = (project) => {
    setEditProject(project)
    form.setFieldsValue({
      name: project.name,
      description: project.description
    })
    setModalOpen(true)
  }

  const handleSubmit = async (values: any) => {
    setCreating(true)
    try {
      const url = editProject ? `/api/projects/${editProject.id}` : '/api/projects'
      const method = editProject ? 'PUT' : 'POST'

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })

      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.message || 'Erreur')
      }

      message.success(editProject ? 'Projet modifié' : 'Projet créé avec succès')
      setModalOpen(false)
      form.resetFields()
      refetch()
    } catch (e: any) {
      message.error(e.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setCreating(false)
    }
  }

  const deleteProject = async (id) => {
    if (!confirm('Supprimer ce projet ?')) return
    
    try {
      const resp = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!resp.ok) throw new Error('Erreur')
      
      message.success('Projet supprimé')
      refetch()
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  const openInviteModal = (project) => {
    setSelectedProject(project)
    setInviteModalOpen(true)
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              Projets
            </h1>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '18px' }}>
              Gérez vos projets et leurs sprints
            </p>
          </div>
          <Button
            type="primary"
            onClick={openCreateModal}
            icon={<Plus size={18} />}
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
            Nouveau projet
          </Button>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card" style={{ height: '200px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ width: '100%', height: '20px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '70%', height: '16px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '50%', height: '14px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Folder size={40} style={{ color: '#1a1a1a' }} />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
              Aucun projet
            </h3>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: '32px', fontSize: '16px' }}>
              Créez votre premier projet pour commencer
            </p>
            <Button
              type="primary"
              onClick={openCreateModal}
              icon={<Plus size={18} />}
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
              Créer un projet
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {projects.map((project) => (
              <div
                key={project.id}
                className="card"
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                onClick={() => navigate('/kanban')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Folder size={24} style={{ color: '#1a1a1a' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openInviteModal(project)
                      }}
                      style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1890ff', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(24, 144, 255, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      title="Inviter par email"
                    >
                      <Mail size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(project)
                      }}
                      style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0, 0, 0, 0.65)', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteProject(project.id)
                      }}
                      style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff4d4f', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  {project.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '16px', lineHeight: '1.5', minHeight: '42px' }}>
                  {project.description || 'Aucune description'}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
                    <Users size={14} />
                    <span>{project.users?.length || 0} membres</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
                    <Calendar size={14} />
                    <span>{project.sprints?.length || 0} sprints</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>{editProject ? 'Modifier le projet' : 'Nouveau projet'}</span>}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
        }}
        footer={null}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: '24px' }}>
          <Form.Item
            label="Nom du projet"
            name="name"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input 
              placeholder="Mon projet" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Description du projet..." 
              rows={4}
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button
              onClick={() => {
                setModalOpen(false)
                form.resetFields()
              }}
              style={{ height: '40px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent', color: '#1a1a1a' }}
            >
              Annuler
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={creating}
              style={{
                height: '40px',
                borderRadius: '8px',
                background: '#000000',
                borderColor: '#000000'
              }}
            >
              {editProject ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal d'invitation par email */}
      <ProjectInviteModal
        projectId={selectedProject?.id || null}
        projectName={selectedProject?.name || ''}
        visible={inviteModalOpen}
        onClose={() => {
          setInviteModalOpen(false)
          setSelectedProject(null)
        }}
      />
    </div>
  )
}
