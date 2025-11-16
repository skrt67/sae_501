import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, message, Select } from 'antd'
import { Plus, Layers, Edit, Trash2, CheckCircle } from 'lucide-react'
import { Epic } from '../../types'

const { TextArea } = Input
const { Option } = Select

interface EpicWithTasks extends Epic {
  tasks_count?: number
}

interface ProjectOption {
  id: number
  name: string
}

export default function Epics() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [epics, setEpics] = useState<EpicWithTasks[]>([])
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editEpic, setEditEpic] = useState<EpicWithTasks | null>(null)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const colors = [
    { value: '#667eea', label: 'Violet' },
    { value: '#11998e', label: 'Turquoise' },
    { value: '#f5576c', label: 'Corail' },
    { value: '#f093fb', label: 'Rose' },
    { value: '#4facfe', label: 'Bleu' },
    { value: '#38ef7d', label: 'Vert' },
    { value: '#ffa726', label: 'Orange' },
  ]

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
  }, [token, navigate])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load projects
      const projectResp = await fetch('/api/projects', { 
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
      })
      if (projectResp.ok) {
        const projectData = await projectResp.json()
        setProjects(Array.isArray(projectData) ? projectData : (projectData.data || []))
      }

      // Load epics
      const epicResp = await fetch('/api/epics', { 
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
      })
      if (epicResp.ok) {
        const epicData = await epicResp.json()
        setEpics(Array.isArray(epicData) ? epicData : (epicData.data || []))
      }
    } catch (e) {
      message.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditEpic(null)
    form.resetFields()
    form.setFieldsValue({ color: '#667eea' })
    setModalOpen(true)
  }

  const openEditModal = (epic: EpicWithTasks) => {
    setEditEpic(epic)
    form.setFieldsValue({
      name: epic.name,
      description: epic.description,
      project_id: epic.project_id,
      color: epic.color
    })
    setModalOpen(true)
  }

  const handleSubmit = async (values: any) => {
    setCreating(true)
    try {
      const url = editEpic ? `/api/epics/${editEpic.id}` : '/api/epics'
      const method = editEpic ? 'PUT' : 'POST'

      const resp = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(values)
      })

      if (!resp.ok) throw new Error('Erreur')

      message.success(editEpic ? 'Epic modifié' : 'Epic créé')
      setModalOpen(false)
      form.resetFields()
      loadData()
    } catch (e) {
      message.error('Erreur lors de l\'enregistrement')
    } finally {
      setCreating(false)
    }
  }

  const deleteEpic = async (id: number) => {
    if (!confirm('Supprimer cet epic ?')) return
    
    try {
      const resp = await fetch(`/api/epics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (!resp.ok) throw new Error('Erreur')
      
      message.success('Epic supprimé')
      loadData()
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
            Epics
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Gérez vos epics et regroupez vos tâches par fonctionnalité
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
          Nouvel epic
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Total Epics</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>{epics.length}</div>
        </div>
        <div className="card" style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>Projets</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>{projects.length}</div>
        </div>
      </div>

      {/* Epics Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card" style={{ height: '200px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
              <div style={{ width: '100%', height: '20px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }} />
              <div style={{ width: '70%', height: '16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }} />
            </div>
          ))}
        </div>
      ) : epics.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-xl)', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Layers size={40} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>
            Aucun epic
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Créez votre premier epic pour regrouper vos tâches
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
            Créer un epic
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {epics.map((epic) => {
            const project = projects.find(p => p.id === epic.project_id)
            
            return (
              <div 
                key={epic.id}
                className="card hover-lift"
                style={{ 
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  borderLeft: `4px solid ${epic.color}`
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: 'var(--radius-md)', 
                    background: epic.color + '15', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Layers size={24} style={{ color: epic.color }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => openEditModal(epic)}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: 'none', 
                        background: 'transparent', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'var(--text-muted)', 
                        transition: 'all 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deleteEpic(epic.id)}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: 'none', 
                        background: 'transparent', 
                        borderRadius: 'var(--radius-sm)', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'var(--error)', 
                        transition: 'all 0.2s' 
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--error)' + '15'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
                  {epic.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5', minHeight: '42px' }}>
                  {epic.description || 'Aucune description'}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {project?.name || 'Projet inconnu'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: epic.color, fontWeight: '600' }}>
                    <CheckCircle size={14} />
                    <span>{epic.tasks_count || 0} tâches</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>{editEpic ? 'Modifier l\'epic' : 'Nouvel epic'}</span>}
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
            label="Nom de l'epic"
            name="name"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input 
              placeholder="Authentification utilisateur" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea 
              placeholder="Description de l'epic..." 
              rows={4}
              style={{ borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label="Projet"
              name="project_id"
              rules={[{ required: true, message: 'Le projet est requis' }]}
            >
              <Select 
                placeholder="Sélectionner un projet"
                style={{ height: '44px' }}
              >
                {projects.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              label="Couleur"
              name="color"
              rules={[{ required: true, message: 'La couleur est requise' }]}
            >
              <Select style={{ height: '44px' }}>
                {colors.map(c => (
                  <Option key={c.value} value={c.value}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: c.value }} />
                      {c.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          
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
              {editEpic ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
