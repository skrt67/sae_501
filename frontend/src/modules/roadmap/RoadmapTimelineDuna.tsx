import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Select, Spin, Button, Tooltip, Modal, Form, Input, DatePicker, message } from 'antd'
import { Calendar, Target, CheckCircle, Zap, TrendingUp, Clock, Plus } from 'lucide-react'
import dayjs from 'dayjs'
import './RoadmapTimeline-light.css'

interface Epic {
  id: number
  name: string
  description: string
  start_date: string
  end_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold'
  project_id: number
  phase?: 'plan' | 'develop' | 'test' | 'launch'
}

interface Project {
  id: number
  name: string
}

interface Sprint {
  id: number
  name: string
  phase?: string
  goal?: string
  starts_at: string
  ends_at: string
  project_id: number
  is_active: boolean
}

export default function RoadmapTimelineDuna() {
  const { token } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [epics, setEpics] = useState<Epic[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [year] = useState(new Date().getFullYear())
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    setLoading(true)
    try {
      const projectResp = await fetch('/api/projects', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (projectResp.ok) {
        const projectData = await projectResp.json()
        const projectsArray = Array.isArray(projectData) ? projectData : projectData.data || []
        setProjects(projectsArray)
        if (projectsArray.length > 0) {
          setSelectedProject(projectsArray[0].id)
        }
      }

      const epicResp = await fetch('/api/epics', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (epicResp.ok) {
        const epicData = await epicResp.json()
        const epicsArray = Array.isArray(epicData) ? epicData : epicData.data || []
        setEpics(epicsArray)
      }

      const sprintResp = await fetch('/api/sprints', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (sprintResp.ok) {
        const sprintData = await sprintResp.json()
        const sprintsArray = Array.isArray(sprintData) ? sprintData : sprintData.data || []
        setSprints(sprintsArray)
      }
    } catch (error) {
      console.error('Erreur chargement roadmap:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSprint = async (values: any) => {
    if (!selectedProject) {
      message.error('Veuillez sélectionner un projet')
      return
    }

    if (!values.dates || values.dates.length !== 2) {
      message.error('Veuillez sélectionner les dates de début et fin')
      return
    }

    try {
      const payload = {
        name: values.name,
        goal: values.goal || '',
        phase: values.phase,
        starts_at: values.dates[0].format('YYYY-MM-DD'),
        ends_at: values.dates[1].format('YYYY-MM-DD'),
        project_id: selectedProject,
        is_active: 1
      }

      const resp = await fetch('/api/sprints', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (resp.ok) {
        message.success('Sprint créé avec succès !')
        setShowSprintModal(false)
        form.resetFields()
        loadData()
      } else {
        const error = await resp.json()
        console.error('Erreur API:', error)
        message.error(error.message || 'Erreur lors de la création du sprint')
      }
    } catch (error) {
      console.error('Erreur création sprint:', error)
      message.error('Erreur lors de la création du sprint')
    }
  }

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  
  const phases = [
    { id: 'plan', label: 'Planning', color: '#0066FF' },
    { id: 'develop', label: 'Développement', color: '#f093fb' },
    { id: 'test', label: 'Tests', color: '#00D9C0' },
    { id: 'launch', label: 'Lancement', color: '#43e97b' }
  ]

  const getPhaseColors = (phase?: string) => {
    if (!phase) return { bg: 'rgba(0, 0, 0, 0.04)', border: '#d9d9d9' }
    
    const phaseLower = phase.toLowerCase().trim()
    
    const phaseMap: Record<string, { bg: string; border: string }> = {
      'planning': { bg: 'rgba(250, 173, 20, 0.15)', border: '#faad14' },
      'développement': { bg: 'rgba(24, 144, 255, 0.15)', border: '#1890ff' },
      'developpement': { bg: 'rgba(24, 144, 255, 0.15)', border: '#1890ff' },
      'test': { bg: 'rgba(114, 46, 209, 0.15)', border: '#722ed1' },
      'lancement': { bg: 'rgba(82, 196, 26, 0.15)', border: '#52c41a' }
    }
    
    return phaseMap[phaseLower] || { bg: 'rgba(0, 0, 0, 0.04)', border: '#d9d9d9' }
  }

  let filteredEpics = selectedProject 
    ? epics.filter(e => e.project_id === selectedProject)
    : epics

  if (selectedPhase) {
    filteredEpics = filteredEpics.filter(e => e.phase === selectedPhase)
  }

  const getMonthPosition = (date: string) => {
    if (!date) return 0
    const d = new Date(date)
    if (isNaN(d.getTime())) return 0
    const month = d.getMonth()
    return (month / 12) * 100
  }

  const getSprintWidth = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 5
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 5
    const startMonth = start.getMonth()
    const endMonth = end.getMonth()
    const duration = Math.max(1, endMonth - startMonth + 1)
    return Math.max(5, (duration / 12) * 100)
  }

  const deleteSprint = async (sprintId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Supprimer ce sprint ?')) return
    
    try {
      const resp = await fetch(`/api/sprints/${sprintId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (resp.ok) {
        message.success('Sprint supprimé')
        loadData()
      } else {
        message.error('Erreur lors de la suppression')
      }
    } catch (error) {
      message.error('Erreur lors de la suppression')
    }
  }

  const totalEpics = filteredEpics.length
  const completedEpics = filteredEpics.filter(e => e.status === 'completed').length
  const inProgressEpics = filteredEpics.filter(e => e.status === 'in_progress').length
  const completionRate = totalEpics > 0 ? Math.round((completedEpics / totalEpics) * 100) : 0

  const currentMonth = new Date().getMonth()
  const currentProgress = ((currentMonth + 1) / 12) * 100

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      padding: '60px 40px' 
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <h1 style={{ 
                fontSize: '42px', 
                fontWeight: 600, 
                color: '#1a1a1a', 
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}>
                Roadmap
              </h1>
              <p style={{ 
                fontSize: '18px', 
                color: 'rgba(0, 0, 0, 0.65)', 
                margin: 0,
                lineHeight: 1.5
              }}>
                Planification et suivi des epics tout au long de l'année
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Select
                placeholder="Sélectionner un projet"
                value={selectedProject}
                onChange={setSelectedProject}
                style={{ width: 250 }}
                size="large"
                options={projects.map(p => ({ value: p.id, label: p.name }))}
              />
              <Button 
                type="primary"
                size="large"
                icon={<Plus size={20} />}
                onClick={() => setShowSprintModal(true)}
                disabled={!selectedProject}
                style={{ 
                  background: '#52c41a', 
                  borderColor: '#52c41a',
                  borderRadius: '8px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500
                }}
              >
                Créer un sprint
              </Button>
            </div>
          </div>
        </header>

        {/* Sprints Section */}
        {selectedProject && sprints.filter(s => s.project_id === selectedProject).length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              color: '#1a1a1a', 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Zap size={24} style={{ color: '#52c41a' }} />
              Sprints actifs
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {sprints
                .filter(s => s.project_id === selectedProject)
                .map(sprint => (
                  <div 
                    key={sprint.id}
                    style={{ 
                      background: sprint.is_active ? '#f6ffed' : '#ffffff',
                      border: sprint.is_active ? '2px solid #52c41a' : '1px solid rgba(0, 0, 0, 0.06)',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '18px', 
                          fontWeight: 600, 
                          color: '#1a1a1a',
                          margin: '0 0 8px 0'
                        }}>
                          {sprint.name}
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {sprint.phase && (
                            <span style={{
                              background: getPhaseColors(sprint.phase).bg,
                              color: getPhaseColors(sprint.phase).border,
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 500,
                              border: `1px solid ${getPhaseColors(sprint.phase).border}`
                            }}>
                              {sprint.phase.charAt(0).toUpperCase() + sprint.phase.slice(1)}
                            </span>
                          )}
                          {sprint.is_active && (
                            <span style={{
                              background: '#52c41a',
                              color: '#fff',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 500
                            }}>
                              ACTIF
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => deleteSprint(sprint.id, e)}
                        style={{
                          border: 'none',
                          background: 'rgba(255, 77, 79, 0.1)',
                          color: '#ff4d4f',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff4d4f'
                          e.currentTarget.style.color = '#fff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
                          e.currentTarget.style.color = '#ff4d4f'
                        }}
                        title="Supprimer le sprint"
                      >
                        ×
                      </button>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      color: 'rgba(0, 0, 0, 0.65)',
                      fontSize: '14px',
                      marginBottom: '8px'
                    }}>
                      <Calendar size={16} />
                      <span>
                        {dayjs(sprint.starts_at).format('DD/MM/YYYY')} - {dayjs(sprint.ends_at).format('DD/MM/YYYY')}
                      </span>
                    </div>
                    {sprint.goal && (
                      <p style={{ 
                        margin: '12px 0 0 0',
                        fontSize: '14px',
                        color: 'rgba(0, 0, 0, 0.65)',
                        lineHeight: 1.6
                        }}>
                        {sprint.goal}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        

        {/* Timeline Section */}
        {selectedProject && sprints.filter(s => s.project_id === selectedProject).length === 0 ? (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ 
              fontSize: '64px',
              marginBottom: '24px',
              opacity: 0.3,
              color: '#52c41a'
            }}>
              <Zap size={64} />
            </div>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 600,
              color: '#1a1a1a',
              margin: '0 0 12px 0'
            }}>
              Aucun Sprint Trouvé
            </h2>
            <p style={{ 
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.45)',
              margin: '0 0 32px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Créez un sprint pour planifier votre travail sur la timeline. Les sprints vous permettent d'organiser vos tâches sur des périodes définies.
            </p>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => setShowSprintModal(true)}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 500,
                background: '#52c41a',
                borderColor: '#52c41a'
              }}
            >
              Créer un Sprint
            </Button>
          </div>
        ) : (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: 600, 
              color: '#1a1a1a', 
              margin: '0 0 24px 0' 
            }}>
              Timeline {year}
            </h2>

            {/* Phase Filters */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              flexWrap: 'wrap',
              marginBottom: '32px'
            }}>
              <button
                style={{
                  padding: '8px 16px',
                  border: `2px solid ${selectedPhase === null ? '#1890ff' : 'rgba(0, 0, 0, 0.15)'}`,
                  background: selectedPhase === null ? '#1890ff' : 'transparent',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: selectedPhase === null ? '#ffffff' : 'rgba(0, 0, 0, 0.65)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedPhase(null)}
              >
                Toutes les phases
              </button>
              {phases.map(phase => (
                <button
                  key={phase.id}
                  style={{
                    padding: '8px 16px',
                    border: `2px solid ${selectedPhase === phase.id ? phase.color : 'rgba(0, 0, 0, 0.15)'}`,
                    background: selectedPhase === phase.id ? phase.color : 'transparent',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: selectedPhase === phase.id ? '#ffffff' : 'rgba(0, 0, 0, 0.65)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => setSelectedPhase(phase.id)}
                  onMouseEnter={(e) => {
                    if (selectedPhase !== phase.id) {
                      e.currentTarget.style.borderColor = phase.color
                      e.currentTarget.style.color = phase.color
                      e.currentTarget.style.background = `${phase.color}10`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPhase !== phase.id) {
                      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.15)'
                      e.currentTarget.style.color = 'rgba(0, 0, 0, 0.65)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {phase.label}
                </button>
              ))}
            </div>

            {/* Timeline Container */}
            <div style={{ 
              background: 'rgba(0, 0, 0, 0.02)',
              borderRadius: '12px',
              padding: '24px',
              overflowX: 'auto'
            }}>
              {/* Months */}
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '8px',
                marginBottom: '20px',
                padding: '0 8px',
                minWidth: '800px'
              }}>
                {months.map((month, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 500,
                      color: 'rgba(0, 0, 0, 0.45)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      padding: '8px 4px',
                      background: 'rgba(0, 0, 0, 0.03)',
                      borderRadius: '6px'
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>

              {/* Sprints */}
              <div style={{ 
                position: 'relative',
                minHeight: '480px',
                padding: '8px',
                minWidth: '800px'
              }}>
                {selectedProject && sprints
                  .filter(s => s.project_id === selectedProject)
                  .map((sprint, idx) => {
                    if (!sprint.starts_at || !sprint.ends_at) return null
                    
                    const left = getMonthPosition(sprint.starts_at)
                    const width = getSprintWidth(sprint.starts_at, sprint.ends_at)
                    const top = (idx % 3) * 80
                    
                    const colors = getPhaseColors(sprint.phase)

                    return (
                      <Tooltip
                        key={sprint.id}
                        title={
                          <div>
                            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                              {sprint.name} {sprint.is_active && '(Actif)'}
                            </div>
                            {sprint.phase && (
                              <div style={{ fontSize: 11, marginBottom: 4, opacity: 0.9 }}>
                                Phase: {sprint.phase.charAt(0).toUpperCase() + sprint.phase.slice(1)}
                              </div>
                            )}
                            {sprint.goal && (
                              <div style={{ fontSize: 12, marginBottom: 4 }}>
                                {sprint.goal}
                              </div>
                            )}
                            <div style={{ fontSize: 11, opacity: 0.8 }}>
                              {dayjs(sprint.starts_at).format('DD/MM/YYYY')} → {dayjs(sprint.ends_at).format('DD/MM/YYYY')}
                            </div>
                          </div>
                        }
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: `${left}%`,
                            width: `${width}%`,
                            top: `${top}px`,
                            height: '70px',
                            background: colors.bg,
                            border: `2px solid ${colors.border}`,
                            borderLeft: `4px solid ${colors.border}`,
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: `0 2px 8px ${colors.border}25`
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = `0 4px 16px ${colors.border}40`
                            e.currentTarget.style.zIndex = '10'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = `0 2px 8px ${colors.border}25`
                            e.currentTarget.style.zIndex = '1'
                          }}
                        >
                          <div style={{
                            fontSize: width < 15 ? '11px' : '14px',
                            fontWeight: 600,
                            color: '#1a1a1a',
                            margin: '0 0 4px 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            {width < 15 ? sprint.name.substring(0, 10) + (sprint.name.length > 10 ? '...' : '') : sprint.name}
                            {sprint.phase && width >= 15 && (
                              <span style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                background: colors.border,
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                textTransform: 'uppercase'
                              }}>
                                {sprint.phase.substring(0, 4)}
                              </span>
                            )}
                          </div>
                          {width >= 10 && (
                            <div style={{
                              fontSize: width < 15 ? '10px' : '12px',
                              color: 'rgba(0, 0, 0, 0.45)',
                              margin: 0,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {width >= 15 && <Clock size={10} />}
                              {width < 15 
                                ? dayjs(sprint.starts_at).format('DD/MM') 
                                : `${dayjs(sprint.starts_at).format('DD MMM')} - ${dayjs(sprint.ends_at).format('DD MMM')}`
                              }
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    )
                  })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Modal Création Sprint */}
      <Modal
        title={
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
            Créer un nouveau sprint
          </div>
        }
        open={showSprintModal}
        onCancel={() => {
          setShowSprintModal(false)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateSprint}
          style={{ marginTop: '24px' }}
        >
          <Form.Item
            label="Nom du sprint"
            name="name"
            rules={[{ required: true, message: 'Veuillez entrer un nom' }]}
          >
            <Input 
              placeholder="Ex: Sprint 1, Sprint Planning Q1..." 
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Objectif (optionnel)"
            name="goal"
          >
            <Input.TextArea 
              placeholder="Décrivez l'objectif principal de ce sprint..."
              rows={3}
            />
          </Form.Item>

          <Form.Item
            label="Phase"
            name="phase"
            rules={[{ required: true, message: 'Veuillez sélectionner une phase' }]}
          >
            <Select
              placeholder="Sélectionnez la phase du sprint"
              size="large"
            >
              <Select.Option value="planning">Planning</Select.Option>
              <Select.Option value="développement">Développement</Select.Option>
              <Select.Option value="test">Test</Select.Option>
              <Select.Option value="lancement">Lancement</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Dates"
            name="dates"
            rules={[{ required: true, message: 'Veuillez sélectionner les dates' }]}
          >
            <DatePicker.RangePicker 
              style={{ width: '100%' }}
              size="large"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button 
                onClick={() => {
                  setShowSprintModal(false)
                  form.resetFields()
                }}
                size="large"
              >
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                size="large"
                style={{
                  background: '#52c41a',
                  borderColor: '#52c41a'
                }}
              >
                Créer le sprint
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
