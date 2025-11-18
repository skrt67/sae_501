import { useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useProjects, useEpics, useSprints, useTasks } from '../../hooks'
import { Select, Button, Modal, Form, Input, DatePicker, message, Tooltip } from 'antd'
import { Calendar, Target, Zap, Plus, X } from 'lucide-react'
import dayjs from 'dayjs'

export default function RoadmapTimelineDuna() {
  const { token } = useAuth()
  const { projects } = useProjects()
  const { epics } = useEpics()
  const { sprints, refetch: refetchSprints } = useSprints()
  const { tasks } = useTasks()
  
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [showSprintModal, setShowSprintModal] = useState(false)
  const [selectedEpic, setSelectedEpic] = useState<any>(null)
  const [selectedSprint, setSelectedSprint] = useState<any>(null)
  const [form] = Form.useForm()
  
  // Sélectionner automatiquement le premier projet
  if (projects.length > 0 && !selectedProject) {
    setSelectedProject(projects[0].id)
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
        refetchSprints()
      } else {
        const error = await resp.json()
        message.error(error.message || 'Erreur lors de la création du sprint')
      }
    } catch (error) {
      message.error('Erreur lors de la création du sprint')
    }
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
        refetchSprints()
      } else {
        message.error('Erreur lors de la suppression')
      }
    } catch (error) {
      message.error('Erreur lors de la suppression')
    }
  }

  const deleteEpic = async (epicId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Supprimer cet epic ? Les tâches associées ne seront pas supprimées.')) return
    
    try {
      const resp = await fetch(`/api/epics/${epicId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (resp.ok) {
        message.success('Epic supprimé')
        window.location.reload() // Recharger pour mettre à jour
      } else {
        message.error('Erreur lors de la suppression')
      }
    } catch (error) {
      message.error('Erreur lors de la suppression')
    }
  }

  // Filtrer les données du projet sélectionné
  const projectSprints = selectedProject 
    ? sprints.filter(s => s.project_id === selectedProject).sort((a, b) => 
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      )
    : []

  const projectEpics = selectedProject 
    ? epics.filter(e => e.project_id === selectedProject)
    : []

  const projectTasks = selectedProject 
    ? tasks.filter(t => t.project_id === selectedProject)
    : []

  // Calculer la position et la largeur d'un epic sur la timeline
  const getEpicPosition = (epicId: number) => {
    const epicTasks = projectTasks.filter(t => t.epic_id === epicId && t.sprint_id)
    if (epicTasks.length === 0) return null

    const sprintIds = [...new Set(epicTasks.map(t => t.sprint_id))]
    const epicSprints = projectSprints.filter(s => sprintIds.includes(s.id))
    if (epicSprints.length === 0) return null

    const sortedEpicSprints = epicSprints.sort((a, b) => 
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
    )

    const firstSprintIndex = projectSprints.findIndex(s => s.id === sortedEpicSprints[0].id)
    const lastSprintIndex = projectSprints.findIndex(s => s.id === sortedEpicSprints[sortedEpicSprints.length - 1].id)

    if (firstSprintIndex === -1 || lastSprintIndex === -1) return null

    return {
      startIndex: firstSprintIndex,
      spanCount: lastSprintIndex - firstSprintIndex + 1,
      sprints: sortedEpicSprints,
      taskCount: epicTasks.length,
      completedCount: epicTasks.filter(t => t.status === 'done').length
    }
  }

  const sprintWidth = 280
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
  const currentYear = new Date().getFullYear()

  // Calculer la plage de mois couverte par les sprints
  const getMonthRange = () => {
    if (projectSprints.length === 0) return []
    
    const allDates = projectSprints.flatMap(s => [new Date(s.starts_at), new Date(s.ends_at)])
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    const monthsRange = []
    const current = new Date(minDate.getFullYear(), minDate.getMonth(), 1)
    
    while (current <= maxDate) {
      monthsRange.push({
        month: current.getMonth(),
        year: current.getFullYear(),
        label: `${months[current.getMonth()]} ${current.getFullYear()}`
      })
      current.setMonth(current.getMonth() + 1)
    }
    
    return monthsRange
  }

  const monthRange = getMonthRange()
  const monthWidth = 150

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa', 
      padding: '60px 40px' 
    }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: '48px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            marginBottom: '24px'
          }}>
            <div style={{ flex: 1 }}>
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
                Vue temporelle des epics et sprints du projet
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
                  background: '#000000',
                  borderColor: '#000000',
                  borderRadius: '8px',
                  height: '44px',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 500,
                  fontSize: '15px'
                }}
              >
                Créer un sprint
              </Button>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        {!selectedProject ? (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <Calendar size={64} style={{ color: 'rgba(0, 0, 0, 0.25)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 12px 0' }}>
              Sélectionnez un projet
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.45)', margin: 0 }}>
              Choisissez un projet pour visualiser sa roadmap
            </p>
          </div>
        ) : projectSprints.length === 0 ? (
          <div style={{ 
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            borderRadius: '12px',
            padding: '80px 40px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <Zap size={64} style={{ color: 'rgba(82, 196, 26, 0.3)', marginBottom: '24px' }} />
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 12px 0' }}>
              Aucun Sprint
            </h2>
            <p style={{ 
              fontSize: '16px', 
              color: 'rgba(0, 0, 0, 0.45)', 
              margin: '0 0 32px 0',
              maxWidth: '500px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Créez votre premier sprint pour commencer à planifier votre roadmap
            </p>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={20} />}
              onClick={() => setShowSprintModal(true)}
              style={{
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
                fontWeight: 500,
                borderRadius: '8px',
                background: '#000000',
                borderColor: '#000000'
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
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            {/* Roadmap Timeline */}
            <div style={{ padding: '32px' }}>
              {/* Container avec scroll horizontal */}
              <div style={{ 
                overflowX: 'auto',
                overflowY: 'visible',
                paddingBottom: '20px',
                marginLeft: '-32px',
                marginRight: '-32px',
                paddingLeft: '32px',
                paddingRight: '32px'
              }}>
                <div style={{ 
                  minWidth: `${Math.max(monthRange.length * monthWidth, 1000)}px`,
                  position: 'relative'
                }}>
                  {/* Timeline des mois */}
                  <div style={{ 
                    display: 'flex',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    position: 'relative'
                  }}>
                    {monthRange.map((month, index) => (
                      <div
                        key={`${month.year}-${month.month}`}
                        style={{
                          width: `${monthWidth}px`,
                          flexShrink: 0,
                          textAlign: 'center',
                          padding: '12px 8px',
                          background: 'rgba(0, 0, 0, 0.02)',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#1a1a1a',
                          marginBottom: '4px'
                        }}>
                          {months[month.month]}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'rgba(0, 0, 0, 0.45)'
                        }}>
                          {month.year}
                        </div>
                        {index < monthRange.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: '1px',
                            background: 'rgba(0, 0, 0, 0.06)'
                          }} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Sprints sur la timeline */}
                  <div style={{ 
                    position: 'relative',
                    minHeight: `${Math.max(180, Math.ceil(projectSprints.length / 3) * 60 + 80)}px`,
                    marginBottom: '32px',
                    paddingBottom: '32px',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.45)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Zap size={16} style={{ color: '#52c41a' }} />
                      Sprints
                    </div>
                    {(() => {
                      // Calculer les positions pour éviter les chevauchements
                      const sprintPositions: { [key: number]: { left: number; width: number; row: number } } = {}
                      const rows: { start: number; end: number }[][] = [[]]
                      
                      projectSprints.forEach((sprint, index) => {
                        const startDate = new Date(sprint.starts_at)
                        const endDate = new Date(sprint.ends_at)
                        
                        const startMonthIndex = monthRange.findIndex(m => 
                          m.year === startDate.getFullYear() && m.month === startDate.getMonth()
                        )
                        const endMonthIndex = monthRange.findIndex(m => 
                          m.year === endDate.getFullYear() && m.month === endDate.getMonth()
                        )
                        
                        if (startMonthIndex === -1 || endMonthIndex === -1) return
                        
                        const leftPosition = startMonthIndex * monthWidth
                        const width = ((endMonthIndex - startMonthIndex + 1) * monthWidth) - 8
                        
                        // Trouver la première ligne disponible sans chevauchement
                        let rowIndex = 0
                        let placed = false
                        
                        while (!placed) {
                          if (!rows[rowIndex]) rows[rowIndex] = []
                          
                          const hasOverlap = rows[rowIndex].some(existing => 
                            !(endMonthIndex < existing.start || startMonthIndex > existing.end)
                          )
                          
                          if (!hasOverlap) {
                            rows[rowIndex].push({ start: startMonthIndex, end: endMonthIndex })
                            sprintPositions[sprint.id] = { left: leftPosition, width, row: rowIndex }
                            placed = true
                          } else {
                            rowIndex++
                          }
                        }
                      })
                      
                      return projectSprints.map((sprint) => {
                        const pos = sprintPositions[sprint.id]
                        if (!pos) return null
                        
                        const topPosition = 40 + (pos.row * 60)

                        return (
                          <div
                          key={sprint.id}
                          onClick={() => setSelectedSprint(sprint)}
                          style={{
                            position: 'absolute',
                            left: `${pos.left + 4}px`,
                            top: `${topPosition}px`,
                            width: `${pos.width}px`,
                            minHeight: '56px',
                            background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.12), rgba(82, 196, 26, 0.05))',
                            border: '2px solid #52c41a',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 12px rgba(82, 196, 26, 0.15)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 2
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(82, 196, 26, 0.25)'
                            e.currentTarget.style.zIndex = '10'
                            e.currentTarget.style.borderWidth = '3px'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(82, 196, 26, 0.15)'
                            e.currentTarget.style.zIndex = '2'
                            e.currentTarget.style.borderWidth = '2px'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            flex: 1,
                            minWidth: 0
                          }}>
                            <Zap size={16} style={{ color: '#52c41a', flexShrink: 0 }} />
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: '#1a1a1a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              letterSpacing: '-0.01em'
                            }}>
                              {sprint.name}
                            </div>
                          </div>
                          <button
                            onClick={(e) => deleteSprint(sprint.id, e)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'rgba(0, 0, 0, 0.45)',
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              padding: 0,
                              marginLeft: '8px',
                              flexShrink: 0
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
                              e.currentTarget.style.color = '#ff4d4f'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                        )
                      })
                    })()}
                  </div>

                  {/* Epics sur la timeline */}
                  <div style={{ position: 'relative', minHeight: '300px' }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'rgba(0, 0, 0, 0.45)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Target size={16} style={{ color: '#722ed1' }} />
                      Epics
                    </div>
                    
                    {(() => {
                      // Calculer les positions des epics pour éviter les chevauchements
                      const epicPositions: { [key: number]: { left: number; width: number; row: number; position: any } } = {}
                      const epicRows: { start: number; end: number }[][] = [[]]
                      
                      projectEpics.forEach((epic) => {
                        const position = getEpicPosition(epic.id)
                        if (!position) return

                        const startDate = new Date(position.sprints[0].starts_at)
                        const endDate = new Date(position.sprints[position.sprints.length - 1].ends_at)
                        
                        const startMonthIndex = monthRange.findIndex(m => 
                          m.year === startDate.getFullYear() && m.month === startDate.getMonth()
                        )
                        const endMonthIndex = monthRange.findIndex(m => 
                          m.year === endDate.getFullYear() && m.month === endDate.getMonth()
                        )
                        
                        if (startMonthIndex === -1 || endMonthIndex === -1) return
                        
                        const leftPosition = startMonthIndex * monthWidth
                        const width = ((endMonthIndex - startMonthIndex + 1) * monthWidth) - 8
                        
                        // Trouver la première ligne disponible sans chevauchement
                        let rowIndex = 0
                        let placed = false
                        
                        while (!placed) {
                          if (!epicRows[rowIndex]) epicRows[rowIndex] = []
                          
                          const hasOverlap = epicRows[rowIndex].some(existing => 
                            !(endMonthIndex < existing.start || startMonthIndex > existing.end)
                          )
                          
                          if (!hasOverlap) {
                            epicRows[rowIndex].push({ start: startMonthIndex, end: endMonthIndex })
                            epicPositions[epic.id] = { left: leftPosition, width, row: rowIndex, position }
                            placed = true
                          } else {
                            rowIndex++
                          }
                        }
                      })
                      
                      return projectEpics.map((epic) => {
                        const epicPos = epicPositions[epic.id]
                        if (!epicPos) return null
                        
                        const topPosition = 40 + (epicPos.row * 90)

                        return (
                          <div
                            key={epic.id}
                            onClick={() => setSelectedEpic(epic)}
                            style={{
                              position: 'absolute',
                              left: `${epicPos.left + 4}px`,
                              top: `${topPosition}px`,
                              width: `${epicPos.width}px`,
                              minHeight: '68px',
                              background: `linear-gradient(135deg, ${epic.color || '#722ed1'}08, ${epic.color || '#722ed1'}03)`,
                              border: `2px solid ${epic.color || '#722ed1'}`,
                              borderRadius: '12px',
                              padding: '14px 18px',
                              display: 'flex',
                              alignItems: 'flex-start',
                              justifyContent: 'space-between',
                              gap: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: `0 4px 12px ${epic.color || '#722ed1'}15`,
                              backdropFilter: 'blur(8px)',
                              zIndex: 1
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)'
                              e.currentTarget.style.boxShadow = `0 8px 24px ${epic.color || '#722ed1'}25`
                              e.currentTarget.style.zIndex = '20'
                              e.currentTarget.style.borderWidth = '3px'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)'
                              e.currentTarget.style.boxShadow = `0 4px 12px ${epic.color || '#722ed1'}15`
                              e.currentTarget.style.zIndex = '1'
                              e.currentTarget.style.borderWidth = '2px'
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                              flex: 1,
                              minWidth: 0
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <div style={{
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  background: epic.color || '#722ed1',
                                  flexShrink: 0,
                                  boxShadow: `0 0 0 3px ${epic.color || '#722ed1'}20`
                                }} />
                                <div style={{
                                  fontSize: '15px',
                                  fontWeight: 700,
                                  color: '#1a1a1a',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  letterSpacing: '-0.01em'
                                }}>
                                  {epic.name}
                                </div>
                              </div>
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                background: epic.color || '#722ed1',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: '#ffffff',
                                alignSelf: 'flex-start',
                                boxShadow: `0 2px 8px ${epic.color || '#722ed1'}30`
                              }}>
                                <span>{epicPos.position.taskCount}</span>
                                <span style={{ opacity: 0.9 }}>tâche{epicPos.position.taskCount > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', paddingTop: '4px' }}>
                              <button
                                onClick={(e) => deleteEpic(epic.id, e)}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'rgba(0, 0, 0, 0.45)',
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                  padding: 0
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
                                  e.currentTarget.style.color = '#ff4d4f'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
                                }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
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
                  background: '#000000',
                  borderColor: '#000000',
                  borderRadius: '8px',
                  height: '40px'
                }}
              >
                Créer le sprint
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Détails Epic */}
      {selectedEpic && (
        <Modal
          open={true}
          onCancel={() => setSelectedEpic(null)}
          footer={null}
          width={700}
        >
          <div style={{ padding: '8px 0' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: selectedEpic.color || '#722ed1',
                  boxShadow: `0 0 0 4px ${selectedEpic.color || '#722ed1'}20`
                }} />
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                  {selectedEpic.name}
                </h2>
              </div>
              {selectedEpic.description && (
                <p style={{ fontSize: '15px', color: 'rgba(0, 0, 0, 0.65)', margin: 0, lineHeight: 1.6 }}>
                  {selectedEpic.description}
                </p>
              )}
            </div>

            {/* Tâches de l'epic */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                Tâches associées ({projectTasks.filter(t => t.epic_id === selectedEpic.id).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {projectTasks.filter(t => t.epic_id === selectedEpic.id).length === 0 ? (
                  <div style={{ 
                    padding: '32px', 
                    textAlign: 'center', 
                    background: 'rgba(0, 0, 0, 0.02)', 
                    borderRadius: '8px',
                    color: 'rgba(0, 0, 0, 0.45)'
                  }}>
                    Aucune tâche associée à cet epic
                  </div>
                ) : (
                  projectTasks.filter(t => t.epic_id === selectedEpic.id).map(task => (
                    <div
                      key={task.id}
                      style={{
                        padding: '16px',
                        background: '#ffffff',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: '#1a1a1a',
                          marginBottom: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                          {task.assignee?.name || 'Non assigné'}
                          {task.sprint && ` • Sprint: ${projectSprints.find(s => s.id === task.sprint_id)?.name || 'N/A'}`}
                        </div>
                      </div>
                      <div style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        background: task.status === 'done' ? '#52c41a' : task.status === 'in_progress' ? '#1890ff' : '#d9d9d9',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        flexShrink: 0
                      }}>
                        {task.status === 'done' ? 'Terminé' : task.status === 'in_progress' ? 'En cours' : 'À faire'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: `linear-gradient(135deg, ${selectedEpic.color || '#722ed1'}08, ${selectedEpic.color || '#722ed1'}03)`,
              borderRadius: '8px',
              border: `1px solid ${selectedEpic.color || '#722ed1'}30`
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#52c41a' }}>
                    {projectTasks.filter(t => t.epic_id === selectedEpic.id && t.status === 'done').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>Terminées</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}>
                    {projectTasks.filter(t => t.epic_id === selectedEpic.id && t.status === 'in_progress').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>En cours</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(0, 0, 0, 0.45)' }}>
                    {projectTasks.filter(t => t.epic_id === selectedEpic.id && t.status === 'todo').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>À faire</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Détails Sprint */}
      {selectedSprint && (
        <Modal
          open={true}
          onCancel={() => setSelectedSprint(null)}
          footer={null}
          width={700}
        >
          <div style={{ padding: '8px 0' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.15), rgba(82, 196, 26, 0.05))',
                  border: '2px solid #52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Zap size={20} style={{ color: '#52c41a' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px 0' }}>
                    {selectedSprint.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)' }}>
                    {dayjs(selectedSprint.starts_at).format('DD MMM YYYY')} - {dayjs(selectedSprint.ends_at).format('DD MMM YYYY')}
                  </div>
                </div>
              </div>
              {selectedSprint.goal && (
                <div style={{ 
                  padding: '12px 16px', 
                  background: 'rgba(82, 196, 26, 0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(82, 196, 26, 0.15)'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                    OBJECTIF
                  </div>
                  <p style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.85)', margin: 0, lineHeight: 1.6 }}>
                    {selectedSprint.goal}
                  </p>
                </div>
              )}
            </div>

            {/* Tâches du sprint */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
                Tâches du sprint ({projectTasks.filter(t => t.sprint_id === selectedSprint.id).length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                {projectTasks.filter(t => t.sprint_id === selectedSprint.id).length === 0 ? (
                  <div style={{ 
                    padding: '32px', 
                    textAlign: 'center', 
                    background: 'rgba(0, 0, 0, 0.02)', 
                    borderRadius: '8px',
                    color: 'rgba(0, 0, 0, 0.45)'
                  }}>
                    Aucune tâche associée à ce sprint
                  </div>
                ) : (
                  projectTasks.filter(t => t.sprint_id === selectedSprint.id).map(task => {
                    const taskEpic = projectEpics.find(e => e.id === task.epic_id)
                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '16px',
                          background: '#ffffff',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: 600, 
                            color: '#1a1a1a',
                            marginBottom: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)' }}>
                              {task.assignee?.name || 'Non assigné'}
                            </span>
                            {taskEpic && (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: `${taskEpic.color}15`,
                                border: `1px solid ${taskEpic.color}30`
                              }}>
                                <div style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: taskEpic.color
                                }} />
                                <span style={{ fontSize: '11px', fontWeight: 600, color: taskEpic.color }}>
                                  {taskEpic.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: task.status === 'done' ? '#52c41a' : task.status === 'in_progress' ? '#1890ff' : '#d9d9d9',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {task.status === 'done' ? 'Terminé' : task.status === 'in_progress' ? 'En cours' : 'À faire'}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Stats */}
            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: 'linear-gradient(135deg, rgba(82, 196, 26, 0.08), rgba(82, 196, 26, 0.03))',
              borderRadius: '8px',
              border: '1px solid rgba(82, 196, 26, 0.2)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#52c41a' }}>
                    {projectTasks.filter(t => t.sprint_id === selectedSprint.id && t.status === 'done').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>Terminées</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#1890ff' }}>
                    {projectTasks.filter(t => t.sprint_id === selectedSprint.id && t.status === 'in_progress').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>En cours</div>
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'rgba(0, 0, 0, 0.45)' }}>
                    {projectTasks.filter(t => t.sprint_id === selectedSprint.id && t.status === 'todo').length}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>À faire</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
