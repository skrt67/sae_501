import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useWorkspace } from '../../contexts/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, message } from 'antd'
import { Plus, Folder, Users, Calendar, Trash2, Edit, UserPlus } from 'lucide-react'
import ProjectMembersModal from '../../components/ProjectMembersModal'
import { Project } from '../../types'

export default function Projects() {
  const { token } = useAuth()
  const { currentWorkspace } = useWorkspace()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
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
      if (!resp.ok) throw new Error('Erreur de chargement')
      const data = await resp.json()
      setProjects(Array.isArray(data) ? data : (data.data || []))
    } catch (e) {
      message.error('Impossible de charger les projets')
    } finally {
      setLoading(false)
    }
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
      if (!currentWorkspace && !editProject) {
        message.error('Veuillez sélectionner un workspace')
        setCreating(false)
        return
      }

      const url = editProject ? `/api/projects/${editProject.id}` : '/api/projects'
      const method = editProject ? 'PUT' : 'POST'

      // Ajouter le workspace_id pour les nouveaux projets
      const payload = editProject
        ? values
        : { ...values, workspace_id: currentWorkspace?.id }

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!resp.ok) {
        const error = await resp.json()
        throw new Error(error.message || 'Erreur')
      }

      message.success(editProject ? 'Projet modifié' : 'Projet créé et partagé avec tous les membres du workspace')
      setModalOpen(false)
      form.resetFields()
      loadProjects()
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
      loadProjects()
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  const openMembersModal = (project) => {
    setSelectedProject(project)
    setMembersModalOpen(true)
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
            Projets
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Gérez vos projets et leurs sprints
          </p>
        </div>
        <Button 
          type="primary" 
          onClick={openCreateModal}
          icon={<Plus size={18} />}
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
          Nouveau projet
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '200px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ width: '100%', height: '20px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
              <div style={{ width: '70%', height: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
              <div style={{ width: '50%', height: '14px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Folder size={40} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
            Aucun projet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Créez votre premier projet pour commencer
          </p>
          <Button 
            type="primary" 
            onClick={openCreateModal}
            icon={<Plus size={18} />}
            style={{ 
              background: 'var(--primary)', 
              borderColor: 'var(--primary)', 
              height: '44px', 
              padding: '0 24px', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 500 
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
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onClick={() => navigate('/kanban')}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Folder size={24} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openMembersModal(project)
                    }}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary)' + '15'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title="Gérer les membres"
                  >
                    <UserPlus size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(project)
                    }}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project.id)
                    }}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--error)', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error)' + '15'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                {project.name}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5', minHeight: '42px' }}>
                {project.description || 'Aucune description'}
              </p>

              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Users size={14} />
                  <span>{project.users?.length || 0} membres</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Calendar size={14} />
                  <span>{project.sprints?.length || 0} sprints</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              style={{ height: '40px', borderRadius: 'var(--radius-md)' }}
            >
              Annuler
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={creating}
              style={{ 
                height: '40px', 
                borderRadius: 'var(--radius-md)', 
                background: 'var(--primary)', 
                borderColor: 'var(--primary)' 
              }}
            >
              {editProject ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal de gestion des membres */}
      <ProjectMembersModal
        visible={membersModalOpen}
        onClose={() => {
          setMembersModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onMembersUpdated={loadProjects}
      />
    </div>
  )
}
