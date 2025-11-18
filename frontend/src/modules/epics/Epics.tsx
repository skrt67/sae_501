import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useProjects, useEpics } from '../../hooks'
import { Button, Modal, Form, Input, message, Select } from 'antd'
import { Plus, Layers, Edit, Trash2, CheckCircle } from 'lucide-react'

const { TextArea } = Input
const { Option } = Select

export default function Epics() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { epics, loading, refetch } = useEpics()
  
  const [modalOpen, setModalOpen] = useState(false)
  const [editEpic, setEditEpic] = useState<any | null>(null)
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

  if (!token) {
    navigate('/login')
    return null
  }

  const openCreateModal = () => {
    setEditEpic(null)
    form.resetFields()
    form.setFieldsValue({ color: '#667eea' })
    setModalOpen(true)
  }

  const openEditModal = (epic: any) => {
    setEditEpic(epic)
    form.setFieldsValue({
      name: epic.name,
      description: epic.description,
      project_id: epic.project_id,
      color: epic.color,
      status: epic.status || 'planned',
      phase: epic.phase
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

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erreur lors de l\'enregistrement')
      }

      message.success(editEpic ? 'Epic modifié' : 'Epic créé')
      setModalOpen(false)
      form.resetFields()
      refetch()
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
      refetch()
    } catch (e) {
      message.error('Erreur lors de la suppression')
    }
  }

  if (!token) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 12px 0', letterSpacing: '-0.02em' }}>
              Epics
            </h1>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '18px' }}>
              Gérez vos epics et regroupez vos tâches par fonctionnalité
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
            Nouvel epic
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          <div style={{ padding: '32px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '8px' }}>Total Epics</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1a1a1a' }}>{epics.length}</div>
          </div>
          <div style={{ padding: '32px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '8px' }}>Projets</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: '#1a1a1a' }}>{projects.length}</div>
          </div>
        </div>

        {/* Epics Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '200px', background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: '12px', padding: '24px' }}>
                <div style={{ width: '100%', height: '20px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px', marginBottom: '12px' }} />
                <div style={{ width: '70%', height: '16px', background: 'rgba(0, 0, 0, 0.04)', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : epics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: 'rgba(0, 0, 0, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Layers size={40} style={{ color: '#1a1a1a' }} />
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
              Aucun epic
            </h3>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: '32px', fontSize: '16px' }}>
              Créez votre premier epic pour regrouper vos tâches
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
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '24px',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${epic.color}`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  cursor: 'pointer'
                }}
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
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: epic.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Layers size={24} style={{ color: epic.color }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(epic)
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(0, 0, 0, 0.65)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.06)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteEpic(epic.id)
                      }}
                      style={{
                        width: '32px',
                        height: '32px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff4d4f',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  {epic.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '16px', lineHeight: '1.5', minHeight: '42px' }}>
                  {epic.description || 'Aucune description'}
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
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
      </div>

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
              style={{ height: '44px', borderRadius: '8px' }}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <TextArea
              placeholder="Description de l'epic..."
              rows={4}
              style={{ borderRadius: '8px' }}
            />
          </Form.Item>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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

            <Form.Item
              label="Statut"
              name="status"
              initialValue="planned"
            >
              <Select style={{ height: '44px' }}>
                <Option value="planned">Planifié</Option>
                <Option value="in_progress">En cours</Option>
                <Option value="completed">Terminé</Option>
                <Option value="on_hold">En attente</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Phase (optionnel)"
            name="phase"
          >
            <Input
              placeholder="Ex: Planning, Développement, Test..."
              style={{ height: '44px', borderRadius: '8px' }}
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
              {editEpic ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
