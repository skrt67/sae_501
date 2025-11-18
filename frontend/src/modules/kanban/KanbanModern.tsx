import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useAuth } from '../auth/AuthContext'
import { Plus, Calendar, Pencil } from 'lucide-react'
import { Modal, Form, Input, Button, message, DatePicker, Select } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import RichTextEditor from '../tasks/RichTextEditor'

const { Option } = Select

interface Epic {
  id: number
  name: string
  color: string
}

interface Task {
  id: number
  title: string
  description?: string
  status: string
  epic?: Epic
  epic_id?: number
  assignee?: {
    id: number
    name: string
    avatar_url?: string
  }
  due_date?: string
}

interface Sprint {
  id: number
  name: string
  starts_at: string
  ends_at: string
}

interface Board {
  columns: {
    todo: Task[]
    in_progress: Task[]
    done: Task[]
  }
  sprint: Sprint | null
}

interface User {
  id: number
  name: string
  email: string
}

interface Project {
  id: number
  name: string
  has_active_sprint?: boolean
  users?: User[]
}

export default function KanbanModern() {
  const { token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newStatus, setNewStatus] = useState('todo')
  const [newAssignee, setNewAssignee] = useState<number | null>(null)
  const [newEpicId, setNewEpicId] = useState<number | null>(null)
  const [newDueDate, setNewDueDate] = useState<string | null>(null)
  const [epics, setEpics] = useState<Epic[]>([])
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editAssignee, setEditAssignee] = useState<number | null>(null)
  const [editEpicId, setEditEpicId] = useState<number | null>(null)
  const [editDueDate, setEditDueDate] = useState<Dayjs | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<number | null>(null)

  // Charger les projets au démarrage
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProjects = async () => {
      setLoading(true)
      try {
        const projectResp = await fetch('/api/projects', { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        if (!projectResp.ok) {
          const t = await projectResp.text().catch(() => '')
          throw new Error(t || 'Erreur de chargement des projets')
        }
        const projectData = await projectResp.json()
        const projectList = Array.isArray(projectData) ? projectData : (Array.isArray(projectData?.data) ? projectData.data : [])
        setProjects(projectList)

        // Vérifier si on a un projectId dans l'URL (priorité)
        const urlParams = new URLSearchParams(window.location.search)
        const urlProjectId = urlParams.get('project')
        
        if (urlProjectId) {
          const projectId = parseInt(urlProjectId, 10)
          if (!isNaN(projectId) && projectList.some(p => p.id === projectId)) {
            setSelectedProjectId(projectId)
            // Nettoyer l'URL
            window.history.replaceState({}, '', '/kanban')
            return // Important: sortir ici pour ne pas écraser
          }
        }
        
        // Sinon, sélectionner automatiquement
        if (projectList.length > 0 && !selectedProjectId) {
          const activeProject = projectList.find(p => p.has_active_sprint)
          const currentProjectId = activeProject ? activeProject.id : projectList[0].id
          setSelectedProjectId(currentProjectId)
        } else if (projectList.length === 0) {
          // Pas de projet, arrêter le loading
          setLoading(false)
        }
      } catch (e) {
        setError(e.message || 'Impossible de charger les projets')
        setLoading(false)
      }
    }

    fetchProjects()
  }, [token, navigate])

  // Charger les données du projet sélectionné
  useEffect(() => {
    if (!token || !selectedProjectId) return

    const fetchProjectData = async () => {
      try {
        // Charger les utilisateurs
        let projectUsers: any[] = []
        const selectedProject = projects.find(p => p.id === selectedProjectId)
        if (selectedProject && selectedProject.users && selectedProject.users.length > 0) {
          projectUsers = selectedProject.users
        } else {
          const projResp = await fetch(`/api/projects/${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}` } })
          if (projResp.ok) {
            const projData = await projResp.json()
            projectUsers = projData.users || []
          }
        }

        if (projectUsers.length === 0) {
          const meResp = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } })
          const me = meResp.ok ? await meResp.json() : null
          if (me && me.id) projectUsers = [{ id: me.id, name: me.name, email: me.email }]
        }
        
        setUsers(projectUsers)

        // Charger les epics
        const epicsResp = await fetch(`/api/epics?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        if (epicsResp.ok) {
          const epicsData = await epicsResp.json()
          const epicsList = Array.isArray(epicsData) ? epicsData : (epicsData.data || [])
          setEpics(epicsList)
        }

        // Charger les sprints
        const sprintsResp = await fetch(`/api/sprints?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } })
        if (sprintsResp.ok) {
          const sprintsData = await sprintsResp.json()
          const sprintsList = Array.isArray(sprintsData) ? sprintsData : (sprintsData.data || [])
          setSprints(sprintsList)
          
          // Sélectionner le sprint actif par défaut si aucun sprint n'est sélectionné
          if (!selectedSprintId && sprintsList.length > 0) {
            const activeSprint = sprintsList.find(s => s.is_active)
            if (activeSprint) {
              setSelectedSprintId(activeSprint.id)
            } else {
              setSelectedSprintId(sprintsList[0].id)
            }
          }
        }
      } catch (e) {
        // Erreur silencieuse
      }
    }

    fetchProjectData()
  }, [token, selectedProjectId, projects])

  // Charger le kanban quand le sprint change
  useEffect(() => {
    if (!token || !selectedProjectId) return

    const fetchKanban = async () => {
      setLoading(true)
      setError('')
      try {
        const sprintParam = selectedSprintId ? `&sprint_id=${selectedSprintId}` : ''
        const kanbanResp = await fetch(`/api/kanban?project_id=${selectedProjectId}${sprintParam}`, { headers: { Authorization: `Bearer ${token}` } })
        
        if (kanbanResp.status === 404) {
          setBoard({ columns: { todo: [], in_progress: [], done: [] }, sprint: null })
        } else if (!kanbanResp.ok) {
          const t = await kanbanResp.text().catch(() => '')
          let msg = 'Erreur de chargement du Kanban'
          try { const j = JSON.parse(t); msg = j.message || msg } catch { /* ignore */ }
          throw new Error(msg)
        } else {
          const kanbanData = await kanbanResp.json()
          setBoard(kanbanData)
        }
      } catch (e) {
        setError(e.message || 'Impossible de charger le Kanban')
      } finally {
        setLoading(false)
      }
    }

    fetchKanban()
  }, [token, selectedProjectId, selectedSprintId])

  useEffect(() => {
    if (location?.state?.openCreateTask) {
      setTaskModalOpen(true)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const taskId = draggableId.split('-')[1]
    const oldStatus = source.droppableId
    const newStatus = destination.droppableId

    if (oldStatus === newStatus) return
    if (!board?.columns) return

    const newBoard: Board = {
      ...board,
      columns: {
        todo: [...board.columns.todo],
        in_progress: [...board.columns.in_progress],
        done: [...board.columns.done]
      }
    }
    
    const taskToMove = newBoard.columns[oldStatus as keyof typeof newBoard.columns].find((task: Task) => task.id == taskId)
    if (!taskToMove) return

    newBoard.columns[oldStatus as keyof typeof newBoard.columns] = newBoard.columns[oldStatus as keyof typeof newBoard.columns].filter((task: Task) => task.id != taskId)
    newBoard.columns[newStatus as keyof typeof newBoard.columns].splice(destination.index, 0, { ...taskToMove, status: newStatus })
    setBoard(newBoard)

    try {
      const resp = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, project_id: selectedProjectId })
      })
      if (!resp.ok) {
        let msg = 'Mise à jour du statut échouée'
        try { const j = await resp.json(); msg = j.message || msg } catch { /* ignore */ }
        throw new Error(msg)
      }
      message.success(`Tâche déplacée`)
    } catch (e: any) {
      message.error(e.message || 'Erreur lors de la mise à jour du statut')
      // Recharger les données en cas d'erreur
      const kanbanResp = await fetch(`/api/kanban?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (kanbanResp.ok) {
        const kanbanData = await kanbanResp.json()
        setBoard(kanbanData)
      }
    }
  }

  const openCreateTask = (status = 'todo') => {
    const locked = !board?.sprint?.id || !selectedProjectId
    if (locked) {
      message.warning('Créez un sprint actif pour ajouter des tâches')
      return
    }
    setNewTitle('')
    setNewDescription('')
    setNewStatus(status)
    setNewAssignee(null)
    setNewEpicId(null)
    setNewDueDate(null)
    setTaskModalOpen(true)
  }

  const createTask = async () => {
    if (!token || !selectedProjectId || !board?.sprint?.id) return
    if (!newTitle.trim()) {
      message.warning('Titre requis')
      return
    }
    setCreating(true)
    try {
      const payload = {
        title: newTitle.trim(),
        description: newDescription,
        sprint_id: board.sprint.id,
        project_id: selectedProjectId,
        status: newStatus,
        assignee_id: newAssignee || null,
        epic_id: newEpicId || null,
        due_date: newDueDate,
      }
      const resp = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (!resp.ok) {
        let msg = 'Création échouée'
        try { const j = await resp.json(); msg = j.message || msg } catch { /* ignore */ }
        throw new Error(msg)
      }
      const refreshed = await fetch(`/api/kanban?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      setBoard(refreshed)
      setTaskModalOpen(false)
      message.success('Tâche créée')
    } catch (e) {
      message.error(e.message || "Impossible de créer la tâche")
    } finally {
      setCreating(false)
    }
  }

  const openEditTask = (task) => {
    setEditTask(task)
    setEditTitle(task.title || '')
    setEditDescription(task.description || '')
    setEditAssignee(task.assignee?.id || null)
    setEditEpicId(task.epic?.id || null)
    setEditDueDate(task.due_date ? dayjs(task.due_date) : null)
  }

  const saveTask = async () => {
    if (!token || !editTask || !editTitle.trim()) return
    try {
      const payload = {
        title: editTitle.trim(),
        description: editDescription,
        assignee_id: editAssignee || null,
        epic_id: editEpicId || null,
        due_date: editDueDate ? editDueDate.format('YYYY-MM-DD') : null,
        project_id: selectedProjectId,
      }
      const resp = await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (!resp.ok) {
        let msg = 'Mise à jour échouée'
        try { const j = await resp.json(); msg = j.message || msg } catch { /* ignore */ }
        throw new Error(msg)
      }
      const refreshed = await fetch(`/api/kanban?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      setBoard(refreshed)
      setEditTask(null)
      message.success('Tâche mise à jour')
    } catch (e) {
      message.error(e.message || "Impossible de mettre à jour la tâche")
    }
  }

  const deleteTask = async (taskId: number) => {
    if (!token || !window.confirm('Supprimer cette tâche ?')) return
    try {
      const resp = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!resp.ok) {
        let msg = 'Suppression échouée'
        try { const j = await resp.json(); msg = j.message || msg } catch { /* ignore */ }
        throw new Error(msg)
      }
      const refreshed = await fetch(`/api/kanban?project_id=${selectedProjectId}`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      setBoard(refreshed)
      message.success('Tâche supprimée')
    } catch (e) {
      message.error(e.message || "Impossible de supprimer la tâche")
    }
  }

  if (!token) return null

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

  if (projects.length === 0 || error || !board) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', maxWidth: '600px', margin: '0 auto', background: '#ffffff', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(0, 0, 0, 0.06)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Plus size={40} style={{ color: '#1a1a1a' }} />
        </div>
        <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
          {error ? 'Erreur' : 'Aucun projet trouvé'}
        </h2>
        <p style={{ color: 'rgba(0, 0, 0, 0.65)', marginBottom: '32px', fontSize: '16px' }}>
          {error || 'Créez un projet pour commencer à utiliser le Kanban'}
        </p>
        <Button type="primary" onClick={() => navigate('/projects')} style={{ background: '#000000', borderColor: '#000000', borderRadius: '8px', height: '48px', padding: '0 32px', fontWeight: 500, fontSize: '16px' }}>
          Créer un projet
        </Button>
      </div>
    )
  }

  const columns = [
    { key: 'todo', title: 'À faire', color: 'rgba(0, 0, 0, 0.45)', count: board?.columns?.todo.length || 0 },
    { key: 'in_progress', title: 'En cours', color: 'rgba(0, 0, 0, 0.65)', count: board?.columns?.in_progress.length || 0 },
    { key: 'done', title: 'Terminé', color: '#000000', count: board?.columns?.done.length || 0 },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      {/* Header Ultra-Moderne */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1600px', margin: '0 auto 32px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {board?.sprint?.name || 'Kanban Board'}
          </h1>
          <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '16px' }}>
            {board?.sprint ? `${dayjs(board.sprint.starts_at).format('DD MMM')} - ${dayjs(board.sprint.ends_at).format('DD MMM YYYY')}` : 'Aucun sprint actif'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Select
            value={selectedProjectId}
            onChange={(value) => {
              setSelectedProjectId(value)
              setSelectedSprintId(null)
              setSprints([])
              setBoard(null)
            }}
            style={{ width: 200 }}
            size="large"
            placeholder="Projet"
          >
            {projects.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name}
              </Option>
            ))}
          </Select>
          <Select
            value={selectedSprintId}
            onChange={(value) => {
              setSelectedSprintId(value)
            }}
            style={{ width: 200 }}
            size="large"
            placeholder="Sprint"
            disabled={!selectedProjectId || sprints.length === 0}
          >
            {sprints.map((s) => (
              <Option key={s.id} value={s.id}>
                {s.name}
              </Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={() => openCreateTask('todo')}
            icon={<Plus size={18} />}
            style={{ background: '#000000', borderColor: '#000000', borderRadius: '8px', height: '44px', padding: '0 24px', fontWeight: 500, fontSize: '15px' }}
          >
            Nouvelle tâche
          </Button>
        </div>
      </div>
      
      {/* Alert si pas de sprint */}
      {!board?.sprint && (
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto 24px',
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.15)',
          borderRadius: '8px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div>
              <div style={{ fontWeight: 600, color: '#1a1a1a', marginBottom: '4px', fontSize: '16px' }}>Aucun sprint actif</div>
              <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>
                Créez un sprint pour pouvoir ajouter des tâches au Kanban
              </div>
            </div>
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/roadmap')}
            style={{
              background: '#000000',
              borderColor: '#000000',
              borderRadius: '8px',
              height: '40px',
              padding: '0 20px',
              fontWeight: 500,
              flexShrink: 0
            }}
          >
            Créer un sprint
          </Button>
        </div>
      )}

      {/* Kanban Board Ultra-Moderne */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1600px', margin: '0 auto' }}>
          {columns.map((column) => (
            <div key={column.key} style={{ 
              background: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              borderRadius: '12px',
              padding: '20px',
              transition: 'all 0.3s ease'
            }}>
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: column.color }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{column.title}</h3>
                  <span style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', background: 'rgba(0, 0, 0, 0.04)', padding: '2px 8px', borderRadius: '12px' }}>
                    {column.count}
                  </span>
                </div>
                <button 
                  onClick={() => openCreateTask(column.key)}
                  style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'rgba(0, 0, 0, 0.45)', cursor: 'pointer', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
                    e.currentTarget.style.color = '#1a1a1a'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
                  }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Column Content */}
              <Droppable droppableId={column.key}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: '400px',
                      background: snapshot.isDraggingOver ? 'rgba(0, 0, 0, 0.02)' : 'transparent',
                      borderRadius: '8px',
                      padding: '4px',
                      transition: 'background 0.2s'
                    }}
                  >
                    {(board?.columns?.[column.key] || []).map((task, index) => (
                      <Draggable draggableId={`${column.key}-${task.id}`} index={index} key={task.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              marginBottom: '12px',
                              background: '#ffffff',
                              border: '1px solid rgba(0, 0, 0, 0.06)',
                              borderRadius: '8px',
                              padding: '16px',
                              cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                              boxShadow: snapshot.isDragging ? '0 8px 24px rgba(0, 0, 0, 0.12)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
                              opacity: snapshot.isDragging ? 0.9 : 1,
                              transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                              transition: 'all 0.2s ease',
                              ...provided.draggableProps.style
                            }}
                            onMouseEnter={(e) => {
                              if (!snapshot.isDragging) {
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                                e.currentTarget.style.transform = 'translateY(-2px)'
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!snapshot.isDragging) {
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
                                e.currentTarget.style.transform = 'translateY(0)'
                              }
                            }}
                          >
                            {/* Task Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                  {task.title}
                                </h4>
                                {task.epic && (
                                  <div style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: task.epic.color || '#d9d9d9',
                                    color: '#ffffff',
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px'
                                  }}>
                                    {task.epic.name}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button 
                                  onClick={() => openEditTask(task)}
                                  style={{ width: '24px', height: '24px', border: 'none', background: 'transparent', color: 'rgba(0, 0, 0, 0.45)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.04)'
                                    e.currentTarget.style.color = '#1a1a1a'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.45)'
                                  }}
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteTask(task.id)
                                  }}
                                  style={{ width: '24px', height: '24px', border: 'none', background: 'transparent', color: 'rgba(255, 77, 79, 0.6)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'
                                    e.currentTarget.style.color = '#ff4d4f'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent'
                                    e.currentTarget.style.color = 'rgba(255, 77, 79, 0.6)'
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>

                            {/* Task Description */}
                            {task.description && (
                              <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)', marginBottom: '12px', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: task.description.substring(0, 100) + (task.description.length > 100 ? '...' : '') }} />
                            )}

                            {/* Task Footer */}
                            {(task.assignee || task.due_date) && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                                {task.assignee && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600', overflow: 'hidden' }}>
                                      {task.assignee.avatar_url ? (
                                        <img
                                          src={task.assignee.avatar_url.startsWith('http') ? task.assignee.avatar_url : `http://localhost:8000${task.assignee.avatar_url}`}
                                          alt={task.assignee.name}
                                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        task.assignee.name?.charAt(0).toUpperCase() || 'U'
                                      )}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>{task.assignee.name}</span>
                                  </div>
                                )}
                                {task.due_date && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'rgba(0, 0, 0, 0.65)' }}>
                                    <Calendar size={14} />
                                    <span>{dayjs(task.due_date).format('DD MMM')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    
                    {/* Empty State */}
                    {board.columns[column.key].length === 0 && (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(0, 0, 0, 0.25)', fontSize: '13px' }}>
                        Aucune tâche
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal Création - Design Moderne */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>Nouvelle tâche</span>}
        open={taskModalOpen}
        onCancel={() => setTaskModalOpen(false)}
        footer={null}
        width={560}
      >
        <Form layout="vertical" onFinish={createTask} style={{ marginTop: '24px' }}>
          <Form.Item label="Titre" required>
            <Input 
              value={newTitle} 
              onChange={(e) => setNewTitle(e.target.value)} 
              placeholder="Titre de la tâche" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item label="Epic">
            <Select
              allowClear
              placeholder="Sélectionner une epic (optionnel)"
              value={newEpicId}
              onChange={setNewEpicId}
              style={{ width: '100%' }}
              size="large"
            >
              {epics.map(epic => (
                <Option key={epic.id} value={epic.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: epic.color }} />
                    {epic.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Assigné à">
              <Select
                allowClear
                placeholder="Sélectionner"
                value={newAssignee}
                onChange={setNewAssignee}
                options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item label="Échéance">
              <DatePicker
                style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-md)' }}
                value={newDueDate ? dayjs(newDueDate) : null}
                onChange={(d) => setNewDueDate(d ? d.format('YYYY-MM-DD') : null)}
              />
            </Form.Item>
          </div>
          
          <Form.Item label="Description">
            <RichTextEditor value={newDescription} onChange={setNewDescription} />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setTaskModalOpen(false)} style={{ height: '40px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent', color: '#1a1a1a' }}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit" loading={creating} style={{ height: '40px', borderRadius: '8px', background: '#000000', borderColor: '#000000' }}>
              Créer
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Édition */}
      <Modal
        title={<span style={{ fontSize: '18px', fontWeight: '600' }}>Modifier la tâche</span>}
        open={!!editTask}
        onCancel={() => setEditTask(null)}
        footer={null}
        width={560}
      >
        <Form layout="vertical" onFinish={saveTask} style={{ marginTop: '24px' }}>
          <Form.Item label="Titre" required>
            <Input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              placeholder="Titre de la tâche" 
              style={{ height: '44px', borderRadius: 'var(--radius-md)' }}
            />
          </Form.Item>
          
          <Form.Item label="Epic">
            <Select
              allowClear
              placeholder="Sélectionner une epic (optionnel)"
              value={editEpicId}
              onChange={setEditEpicId}
              style={{ width: '100%' }}
              size="large"
            >
              {epics.map(epic => (
                <Option key={epic.id} value={epic.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: epic.color }} />
                    {epic.name}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item label="Assigné à">
              <Select
                allowClear
                placeholder="Sélectionner"
                value={editAssignee}
                onChange={setEditAssignee}
                options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item label="Échéance">
              <DatePicker
                style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-md)' }}
                value={editDueDate}
                onChange={(d) => setEditDueDate(d)}
              />
            </Form.Item>
          </div>
          
          <Form.Item label="Description">
            <RichTextEditor value={editDescription} onChange={setEditDescription} />
          </Form.Item>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={() => setEditTask(null)} style={{ height: '40px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: 'transparent', color: '#1a1a1a' }}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit" style={{ height: '40px', borderRadius: '8px', background: '#000000', borderColor: '#000000' }}>
              Enregistrer
            </Button>
          </div>
        </Form>
      </Modal>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
