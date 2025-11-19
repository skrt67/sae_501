import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useTasks, useProjects } from '../../hooks'
import { Search, Calendar, User, Filter, X, ChevronDown } from 'lucide-react'
import { Input, Select, DatePicker, Button, Tag, message } from 'antd'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority?: number
  due_date?: string
  created_at: string
  epic?: {
    id: number
    name: string
    color: string
  }
  assignee?: {
    id: number
    name: string
    email: string

  }
  project?: {
    id: number
    name: string
  }
}

interface User {
  id: number
  name: string
  email: string
}

interface Project {
  id: number
  name: string
}

export default function TasksSearch() {
  const { token } = useAuth()
  const navigate = useNavigate()

  const { tasks: allTasks } = useTasks()
  const { projects: allProjects } = useProjects()

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Filtres
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [selectedPriority, setSelectedPriority] = useState<number | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null)

  // Extraire les utilisateurs uniques des projets
  const users: User[] = []
  const userIds = new Set<number>()
  allProjects.forEach((project: any) => {
    if (project.users && Array.isArray(project.users)) {
      project.users.forEach((user: User) => {
        if (!userIds.has(user.id)) {
          userIds.add(user.id)
          users.push(user)
        }
      })
    }
  })

  const [showFilters, setShowFilters] = useState(false)

  if (!token) {
    navigate('/login')
    return null
  }

  // Initialiser filteredTasks avec allTasks
  useEffect(() => {
    setFilteredTasks(allTasks)
  }, [allTasks])

  // Appliquer les filtres
  useEffect(() => {
    let result = [...allTasks]

    // Filtre par mot-clé
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(keyword) ||
        (task.description && task.description.toLowerCase().includes(keyword))
      )
    }

    // Filtre par statut
    if (selectedStatus) {
      result = result.filter(task => task.status === selectedStatus)
    }

    // Filtre par responsable
    if (selectedAssignee) {
      result = result.filter(task => task.assignee?.id === selectedAssignee)
    }

    // Filtre par projet
    if (selectedProject) {
      result = result.filter(task => task.project?.id === selectedProject)
    }

    // Filtre par priorité
    if (selectedPriority) {
      result = result.filter(task => task.priority === selectedPriority)
    }

    // Filtre par date
    if (dateRange && dateRange[0] && dateRange[1]) {
      result = result.filter(task => {
        if (!task.due_date) return false
        const dueDate = dayjs(task.due_date)
        return dueDate.isAfter(dateRange[0]) && dueDate.isBefore(dateRange[1])
      })
    }

    setFilteredTasks(result)
  }, [searchKeyword, selectedStatus, selectedAssignee, selectedProject, selectedPriority, dateRange, allTasks])

  const clearFilters = () => {
    setSearchKeyword('')
    setSelectedStatus(null)
    setSelectedAssignee(null)
    setSelectedProject(null)
    setSelectedPriority(null)
    setDateRange(null)
  }

  const hasActiveFilters = searchKeyword || selectedStatus || selectedAssignee || selectedProject || selectedPriority || dateRange

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return '#6f767e'
      case 'in_progress': return '#f5576c'
      case 'done': return '#11998e'
      default: return '#6f767e'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire'
      case 'in_progress': return 'En cours'
      case 'done': return 'Terminé'
      default: return status
    }
  }

  const getPriorityLabel = (priority?: number) => {
    if (!priority) return 'Aucune'
    switch (priority) {
      case 1: return 'Très basse'
      case 2: return 'Basse'
      case 3: return 'Moyenne'
      case 4: return 'Haute'
      case 5: return 'Critique'
      default: return `P${priority}`
    }
  }

  const getPriorityColor = (priority?: number) => {
    if (!priority) return '#d9d9d9'
    switch (priority) {
      case 1: return '#52c41a'
      case 2: return '#73d13d'
      case 3: return '#faad14'
      case 4: return '#ff7a45'
      case 5: return '#ff4d4f'
      default: return '#d9d9d9'
    }
  }



  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            Recherche de tâches
          </h1>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '16px' }}>
            {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} trouvée{filteredTasks.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche principale */}
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: showFilters ? '24px' : '0' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(0, 0, 0, 0.45)' }} />
              <Input
                placeholder="Rechercher par titre ou description..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  height: '48px',
                  paddingLeft: '48px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  border: '1px solid rgba(0, 0, 0, 0.15)'
                }}
              />
            </div>
            <Button
              icon={<Filter size={18} />}
              onClick={() => setShowFilters(!showFilters)}
              style={{
                height: '48px',
                padding: '0 24px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 0, 0, 0.15)',
                background: showFilters ? '#000000' : '#ffffff',
                color: showFilters ? '#ffffff' : '#1a1a1a',
                fontWeight: 500
              }}
            >
              Filtres
              <ChevronDown size={16} style={{ marginLeft: '8px', transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </Button>
            {hasActiveFilters && (
              <Button
                icon={<X size={18} />}
                onClick={clearFilters}
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 77, 79, 0.3)',
                  background: '#ffffff',
                  color: '#ff4d4f',
                  fontWeight: 500
                }}
              >
                Réinitialiser
              </Button>
            )}
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                  Statut
                </label>
                <Select
                  allowClear
                  placeholder="Tous les statuts"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="todo">À faire</Option>
                  <Option value="in_progress">En cours</Option>
                  <Option value="done">Terminé</Option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                  Responsable
                </label>
                <Select
                  allowClear
                  showSearch
                  placeholder="Tous les responsables"
                  value={selectedAssignee}
                  onChange={setSelectedAssignee}
                  style={{ width: '100%' }}
                  size="large"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                  Projet
                </label>
                <Select
                  allowClear
                  showSearch
                  placeholder="Tous les projets"
                  value={selectedProject}
                  onChange={setSelectedProject}
                  style={{ width: '100%' }}
                  size="large"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={allProjects.map(p => ({ value: p.id, label: p.name }))}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                  Priorité
                </label>
                <Select
                  allowClear
                  placeholder="Toutes les priorités"
                  value={selectedPriority}
                  onChange={setSelectedPriority}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value={1}>Très basse</Option>
                  <Option value={2}>Basse</Option>
                  <Option value={3}>Moyenne</Option>
                  <Option value={4}>Haute</Option>
                  <Option value={5}>Critique</Option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 500, color: '#1a1a1a' }}>
                  Date d'échéance
                </label>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                />
              </div>
            </div>
          )}
        </div>

        {/* Liste des tâches */}
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredTasks.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              padding: '80px 24px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px', marginTop: '16px' }}>
                Aucune tâche trouvée
              </h3>
              <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0 }}>
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div
                key={task.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
                onClick={() => setSelectedTask(task)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px 0' }}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <div
                        style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)', lineHeight: '1.5' }}
                        dangerouslySetInnerHTML={{
                          __html: task.description.substring(0, 150) + (task.description.length > 150 ? '...' : '')
                        }}
                      />
                    )}
                  </div>
                  <Tag
                    color={getStatusColor(task.status)}
                    style={{
                      margin: '0 0 0 16px',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 500
                    }}
                  >
                    {getStatusLabel(task.status)}
                  </Tag>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  {task.epic && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: task.epic.color || '#d9d9d9',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {task.epic.name}
                    </div>
                  )}

                  {task.project && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
                      <span style={{ fontWeight: 500 }}>Projet:</span>
                      <span>{task.project.name}</span>
                    </div>
                  )}

                  {task.assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                      <span style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
                        {task.assignee.name}
                      </span>
                    </div>
                  )}

                  {task.due_date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} style={{ color: 'rgba(0, 0, 0, 0.45)' }} />
                      <span style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
                        {dayjs(task.due_date).format('DD MMM YYYY')}
                      </span>
                    </div>
                  )}

                  {task.priority && (
                    <Tag
                      color={getPriorityColor(task.priority)}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {getPriorityLabel(task.priority)}
                    </Tag>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal détails de la tâche */}
      {selectedTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedTask(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              padding: '32px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', margin: 0, flex: 1 }}>
                  {selectedTask.title}
                </h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Tag
                  color={getStatusColor(selectedTask.status)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    fontWeight: 500
                  }}
                >
                  {getStatusLabel(selectedTask.status)}
                </Tag>

                {selectedTask.priority && (
                  <Tag
                    color={getPriorityColor(selectedTask.priority)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 500
                    }}
                  >
                    {getPriorityLabel(selectedTask.priority)}
                  </Tag>
                )}
              </div>
            </div>

            {/* Description */}
            {selectedTask.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                  Description
                </h3>
                <div
                  style={{
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.65)',
                    lineHeight: '1.6',
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.02)',
                    borderRadius: '8px'
                  }}
                  dangerouslySetInnerHTML={{ __html: selectedTask.description }}
                />
              </div>
            )}

            {/* Informations */}
            <div style={{ display: 'grid', gap: '16px' }}>
              {selectedTask.project && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                    Projet
                  </div>
                  <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                    {selectedTask.project.name}
                  </div>
                </div>
              )}

              {selectedTask.epic && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                    Epic
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: selectedTask.epic.color || '#d9d9d9',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    {selectedTask.epic.name}
                  </div>
                </div>
              )}

              {selectedTask.assignee && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                    Responsable
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#000000',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {selectedTask.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: 500 }}>
                        {selectedTask.assignee.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)' }}>
                        {selectedTask.assignee.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTask.due_date && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                    Date d'échéance
                  </div>
                  <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                    {dayjs(selectedTask.due_date).format('DD MMMM YYYY')}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>
                  Date de création
                </div>
                <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                  {dayjs(selectedTask.created_at).format('DD MMMM YYYY à HH:mm')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
              <Button
                type="primary"
                onClick={() => {
                  setSelectedTask(null)
                  const projectId = selectedTask.project?.id
                  if (projectId) {
                    navigate(`/kanban?project=${projectId}`)
                  } else {
                    navigate('/kanban')
                  }
                }}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '8px',
                  background: '#000000',
                  borderColor: '#000000',
                  fontWeight: 500
                }}
              >
                Voir dans le Kanban
              </Button>
              <Button
                onClick={() => setSelectedTask(null)}
                style={{
                  height: '44px',
                  borderRadius: '8px',
                  fontWeight: 500
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
