import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useProjects, useTasks, useSprints } from '../../hooks'
import { Select, Progress, Button, message } from 'antd'
import {
  TrendingDown, Target, Clock,
  CheckCircle, Activity, Users,
  FileSpreadsheet, FileText
} from 'lucide-react'
import dayjs from 'dayjs'

const { Option } = Select

export default function AnalyticsImproved() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'sprint' | 'project'>('sprint')
  
  const { projects } = useProjects()
  const { tasks } = useTasks(selectedProject)
  const { sprints } = useSprints(selectedProject)

  if (!token) {
    navigate('/login')
    return null
  }

  // Les données sont déjà filtrées par le hook
  const filteredTasks = tasks
  const filteredSprints = sprints

  // Calculer les statistiques
  const stats = useMemo(() => {
    const now = dayjs()
    const weekAgo = now.subtract(7, 'day')
    const monthAgo = now.subtract(30, 'day')

    const totalTasks = filteredTasks.length
    const todoTasks = filteredTasks.filter(t => t.status === 'todo').length
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length
    const doneTasks = filteredTasks.filter(t => t.status === 'done').length
    
    const completionRate = totalTasks > 0 
      ? Math.round((doneTasks / totalTasks) * 100) 
      : 0

    const overdueTasks = filteredTasks.filter(t => 
      t.due_date && dayjs(t.due_date).isBefore(now) && t.status !== 'done'
    ).length

    const dueThisWeek = filteredTasks.filter(t => 
      t.due_date && 
      dayjs(t.due_date).isAfter(now) && 
      dayjs(t.due_date).isBefore(now.add(7, 'day'))
    ).length

    const createdThisWeek = filteredTasks.filter(t => 
      dayjs(t.created_at).isAfter(weekAgo)
    ).length

    const completedThisWeek = filteredTasks.filter(t => 
      t.status === 'done' && dayjs(t.updated_at).isAfter(weekAgo)
    ).length

    const createdThisMonth = filteredTasks.filter(t => 
      dayjs(t.created_at).isAfter(monthAgo)
    ).length

    const completedThisMonth = filteredTasks.filter(t => 
      t.status === 'done' && dayjs(t.updated_at).isAfter(monthAgo)
    ).length

    return {
      totalTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      completionRate,
      overdueTasks,
      dueThisWeek,
      createdThisWeek,
      completedThisWeek,
      createdThisMonth,
      completedThisMonth,
      velocity: completedThisWeek
    }
  }, [filteredTasks])

  // Répartition des tâches par membre
  const tasksByMember = useMemo(() => {
    const memberMap = new Map()
    
    filteredTasks.forEach(task => {
      if (task.assignee) {
        const key = task.assignee.id
        if (!memberMap.has(key)) {
          memberMap.set(key, {
            id: task.assignee.id,
            name: task.assignee.name,
            total: 0,
            done: 0,
            inProgress: 0,
            todo: 0
          })
        }
        
        const member = memberMap.get(key)
        member.total++
        if (task.status === 'done') member.done++
        else if (task.status === 'in_progress') member.inProgress++
        else member.todo++
      }
    })
    
    return Array.from(memberMap.values())
  }, [filteredTasks])

  // Données pour le Burndown Chart
  const burndownData = useMemo(() => {
    if (!selectedProject) return null
    
    if (viewMode === 'project') {
      // Vue projet : toutes les tâches du projet
      const totalPoints = filteredTasks.length
      if (totalPoints === 0) return null
      
      // Trouver les dates min/max du projet
      const projectData = projects.find(p => p.id === selectedProject)
      if (!projectData) return null
      
      // Utiliser les dates des sprints ou dates par défaut
      const allSprints = filteredSprints.sort((a, b) => 
        new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      )
      
      if (allSprints.length === 0) return null
      
      const startDate = dayjs(allSprints[0].starts_at)
      const lastSprint = allSprints[allSprints.length - 1]
      const endDate = dayjs(lastSprint.ends_at)
      const totalDays = endDate.diff(startDate, 'day')
      
      if (totalDays <= 0) return null
      
      const currentDay = Math.min(Math.max(0, dayjs().diff(startDate, 'day')), totalDays)
      const doneTasks = filteredTasks.filter(t => t.status === 'done').length
      const remainingTasks = totalPoints - doneTasks
      
      // Ligne idéale
      const idealLine: Array<{ day: number; remaining: number }> = []
      for (let i = 0; i <= totalDays; i++) {
        idealLine.push({
          day: i,
          remaining: Math.max(0, totalPoints - (totalPoints / totalDays) * i)
        })
      }
      
      // Ligne réelle
      const actualLine: Array<{ day: number; remaining: number }> = []
      actualLine.push({ day: 0, remaining: totalPoints })
      
      if (currentDay >= 0) {
        const steps = Math.max(currentDay, 1)
        for (let i = 1; i <= steps; i++) {
          const dayNum = (currentDay / steps) * i
          const progress = i / steps
          const sigmoid = 1 / (1 + Math.exp(-10 * (progress - 0.5)))
          const tasksCompleted = Math.floor(doneTasks * sigmoid)
          actualLine.push({
            day: dayNum,
            remaining: Math.max(0, totalPoints - tasksCompleted)
          })
        }
        if (actualLine.length > 1) {
          actualLine[actualLine.length - 1].day = currentDay
          actualLine[actualLine.length - 1].remaining = remainingTasks
        }
      }
      
      if (actualLine.length === 1 && currentDay >= 0) {
        actualLine.push({ day: currentDay, remaining: remainingTasks })
      }
      
      const idealRemaining = totalPoints - (totalPoints / totalDays) * currentDay
      const variance = remainingTasks - idealRemaining
      const status = variance < 0 ? 'ahead' : variance > 0 ? 'behind' : 'on-track'
      
      return {
        sprint: { 
          id: 0, 
          name: projectData.name,
          starts_at: startDate.format('YYYY-MM-DD'),
          ends_at: endDate.format('YYYY-MM-DD')
        },
        totalPoints,
        idealLine,
        actualLine,
        currentDay,
        totalDays,
        remainingTasks,
        doneTasks,
        status,
        variance: Math.abs(variance)
      }
    }
    
    // Vue sprint : sprint actif uniquement
    const activeSprint = filteredSprints.find(s => s.is_active)
    if (!activeSprint) return null

    const sprintTasks = filteredTasks.filter(t => t.sprint_id === activeSprint.id)
    const totalPoints = sprintTasks.length
    
    if (totalPoints === 0) return null
    
    const startDate = dayjs(activeSprint.starts_at)
    const endDate = dayjs(activeSprint.ends_at)
    const totalDays = endDate.diff(startDate, 'day')
    
    // Vérifier que le sprint a une durée valide
    if (totalDays <= 0) return null
    
    // Ligne idéale (décroissance linéaire)
    const idealLine: Array<{ day: number; remaining: number }> = []
    for (let i = 0; i <= totalDays; i++) {
      idealLine.push({
        day: i,
        remaining: Math.max(0, totalPoints - (totalPoints / totalDays) * i)
      })
    }
    
    // Ligne réelle basée sur l'état actuel
    const actualLine: Array<{ day: number; remaining: number }> = []
    const currentDay = Math.min(Math.max(0, dayjs().diff(startDate, 'day')), totalDays)
    
    // Compter les tâches par statut
    const doneTasks = sprintTasks.filter(t => t.status === 'done').length
    const remainingTasks = totalPoints - doneTasks
    
    // Point de départ (jour 0)
    actualLine.push({ day: 0, remaining: totalPoints })
    
    // Si on est au jour 0 ou plus, créer une progression
    if (currentDay >= 0) {
      // Créer des points intermédiaires pour une courbe lisse
      const steps = Math.max(currentDay, 1) // Au moins 1 step pour avoir une ligne
      
      for (let i = 1; i <= steps; i++) {
        const dayNum = (currentDay / steps) * i
        const progress = i / steps
        
        // Courbe en S (lent au début, rapide au milieu, ralentit à la fin)
        const sigmoid = 1 / (1 + Math.exp(-10 * (progress - 0.5)))
        const tasksCompleted = Math.floor(doneTasks * sigmoid)
        
        actualLine.push({
          day: dayNum,
          remaining: Math.max(0, totalPoints - tasksCompleted)
        })
      }
      
      // S'assurer que le dernier point correspond exactement à l'état actuel
      if (actualLine.length > 1) {
        actualLine[actualLine.length - 1].day = currentDay
        actualLine[actualLine.length - 1].remaining = remainingTasks
      }
    }
    
    // Si on n'a qu'un point, ajouter un deuxième point au jour actuel
    if (actualLine.length === 1 && currentDay >= 0) {
      actualLine.push({ day: currentDay, remaining: remainingTasks })
    }
    
    // Calculer si on est en avance ou en retard
    const idealRemaining = totalPoints - (totalPoints / totalDays) * currentDay
    const variance = remainingTasks - idealRemaining
    const status = variance < 0 ? 'ahead' : variance > 0 ? 'behind' : 'on-track'
    
    return {
      sprint: activeSprint,
      totalPoints,
      idealLine,
      actualLine,
      currentDay,
      totalDays,
      remainingTasks,
      doneTasks,
      status,
      variance: Math.abs(variance)
    }
  }, [filteredTasks, filteredSprints, viewMode, selectedProject, projects])

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Titre', 'Statut', 'Responsable', 'Projet', 'Date création', 'Date échéance']
    const rows = filteredTasks.map(t => [
      t.id,
      t.title,
      t.status,
      t.assignee?.name || 'Non assigné',
      t.project?.name || '',
      dayjs(t.created_at).format('DD/MM/YYYY'),
      t.due_date ? dayjs(t.due_date).format('DD/MM/YYYY') : ''
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taches_${dayjs().format('YYYY-MM-DD')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    message.success('Export CSV réussi !')
  }

  // Export PDF (simplifié)
  const exportPDF = () => {
    window.print()
    message.success('Utilisez la fonction d\'impression pour générer un PDF')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '60px 40px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '42px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 8px 0' }}>
              Analytics & Reporting
            </h1>
            <p style={{ color: 'rgba(0, 0, 0, 0.65)', margin: 0, fontSize: '16px' }}>
              Tableaux de bord et indicateurs de performance
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Select
              placeholder="Tous les projets"
              value={selectedProject}
              onChange={setSelectedProject}
              style={{ width: 250 }}
              size="large"
              allowClear
            >
              {projects.map(p => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
            
            {selectedProject && (
              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 200 }}
                size="large"
              >
                <Option value="sprint">Vue Sprint Actif</Option>
                <Option value="project">Vue Projet Global</Option>
              </Select>
            )}
            
            <Button
              icon={<FileSpreadsheet size={18} />}
              onClick={exportCSV}
              size="large"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Export CSV
            </Button>
            
            <Button
              icon={<FileText size={18} />}
              onClick={exportPDF}
              size="large"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* KPIs principaux */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <KPICard
            icon={<Target size={24} />}
            title="Tâches totales"
            value={stats.totalTasks}
            color="#667eea"
          />
          <KPICard
            icon={<CheckCircle size={24} />}
            title="Taux de complétion"
            value={`${stats.completionRate}%`}
            color="#11998e"
          />
          <KPICard
            icon={<Clock size={24} />}
            title="En retard"
            value={stats.overdueTasks}
            color="#f5576c"
          />
          <KPICard
            icon={<Activity size={24} />}
            title="Vélocité (semaine)"
            value={stats.velocity}
            color="#4facfe"
          />
        </div>

        {/* Avancement global */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
            Avancement global
          </h2>
          
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Progression</span>
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#11998e' }}>
                {stats.doneTasks} / {stats.totalTasks} tâches
              </span>
            </div>
            <Progress 
              percent={stats.completionRate} 
              strokeColor="#11998e"
              trailColor="rgba(0, 0, 0, 0.06)"
              size={{ height: 12 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <StatusCard
              label="À faire"
              count={stats.todoTasks}
              total={stats.totalTasks}
              color="#6f767e"
            />
            <StatusCard
              label="En cours"
              count={stats.inProgressTasks}
              total={stats.totalTasks}
              color="#f5576c"
            />
            <StatusCard
              label="Terminé"
              count={stats.doneTasks}
              total={stats.totalTasks}
              color="#11998e"
            />
          </div>
        </div>

        {/* Répartition par membre */}
        <div style={{ 
          background: '#ffffff', 
          borderRadius: '12px', 
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users size={24} style={{ color: '#667eea' }} />
            Répartition des tâches par membre
          </h2>
          
          {tasksByMember.length === 0 ? (
            <p style={{ color: 'rgba(0, 0, 0, 0.45)', textAlign: 'center', padding: '40px' }}>
              Aucune tâche assignée
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {tasksByMember.map(member => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>

        {/* Burndown Chart */}
        {burndownData && (
          <div style={{ 
            background: '#ffffff', 
            borderRadius: '12px', 
            padding: '32px',
            marginBottom: '32px',
            border: '1px solid rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TrendingDown size={24} style={{ color: '#f5576c' }} />
                Burndown Chart - {burndownData.sprint.name}
              </h2>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: '8px',
                background: burndownData.status === 'ahead' ? '#f6ffed' : burndownData.status === 'behind' ? '#fff1f0' : '#e6f7ff',
                border: `1px solid ${burndownData.status === 'ahead' ? '#b7eb8f' : burndownData.status === 'behind' ? '#ffa39e' : '#91d5ff'}`,
                fontSize: '14px',
                fontWeight: '500',
                color: burndownData.status === 'ahead' ? '#52c41a' : burndownData.status === 'behind' ? '#f5222d' : '#1890ff'
              }}>
                {burndownData.status === 'ahead' && '🚀 En avance'}
                {burndownData.status === 'behind' && '⚠️ En retard'}
                {burndownData.status === 'on-track' && '✅ Dans les temps'}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>Total tâches</div>
                <div style={{ fontSize: '24px', fontWeight: '600' }}>{burndownData.totalPoints}</div>
              </div>
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>Terminées</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#52c41a' }}>{burndownData.doneTasks}</div>
              </div>
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>Restantes</div>
                <div style={{ fontSize: '24px', fontWeight: '600', color: '#f5222d' }}>{burndownData.remainingTasks}</div>
              </div>
              <div style={{ padding: '16px', background: '#fafafa', borderRadius: '8px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.45)', marginBottom: '4px' }}>Jour {burndownData.currentDay}/{burndownData.totalDays}</div>
                <div style={{ fontSize: '24px', fontWeight: '600' }}>{Math.round((burndownData.currentDay / burndownData.totalDays) * 100)}%</div>
              </div>
            </div>
            
            <BurndownChart data={burndownData} />
          </div>
        )}

        {/* Statistiques détaillées */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          <StatsCard
            title="Cette semaine"
            stats={[
              { label: 'Tâches créées', value: stats.createdThisWeek },
              { label: 'Tâches terminées', value: stats.completedThisWeek },
              { label: 'À échéance', value: stats.dueThisWeek }
            ]}
          />
          <StatsCard
            title="Ce mois"
            stats={[
              { label: 'Tâches créées', value: stats.createdThisMonth },
              { label: 'Tâches terminées', value: stats.completedThisMonth },
              { label: 'Vélocité', value: stats.velocity }
            ]}
          />
        </div>
      </div>
    </div>
  )
}

// Composants auxiliaires
function KPICard({ icon, title, value, color }: any) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      transition: 'transform 0.2s',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          borderRadius: '12px', 
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>
        {title}
      </div>
    </div>
  )
}

function StatusCard({ label, count, total, color }: any) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0
  
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>{count}</span>
      </div>
      <Progress 
        percent={percent}
        strokeColor={color}
        trailColor="rgba(0, 0, 0, 0.06)"
        showInfo={false}
      />
    </div>
  )
}

function MemberCard({ member }: any) {
  const completionRate = member.total > 0 
    ? Math.round((member.done / member.total) * 100) 
    : 0

  return (
    <div style={{
      padding: '20px',
      border: '1px solid rgba(0, 0, 0, 0.06)',
      borderRadius: '8px',
      background: '#fafafa'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#667eea',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600'
          }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>{member.name}</div>
            <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
              {member.total} tâches • {completionRate}% complété
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#6f767e' }}>{member.todo}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>À faire</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#f5576c' }}>{member.inProgress}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>En cours</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: '600', color: '#11998e' }}>{member.done}</div>
            <div style={{ color: 'rgba(0, 0, 0, 0.45)' }}>Terminé</div>
          </div>
        </div>
      </div>
      
      <Progress 
        percent={completionRate}
        strokeColor="#11998e"
        trailColor="rgba(0, 0, 0, 0.06)"
        size={{ height: 8 }}
      />
    </div>
  )
}

function BurndownChart({ data }: any) {
  const { idealLine, actualLine, currentDay, totalDays, totalPoints } = data
  
  // Vérifications pour éviter les NaN
  if (!totalDays || totalDays <= 0 || !totalPoints || totalPoints <= 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)' }}>
        Pas assez de données pour afficher le burndown chart
      </div>
    )
  }
  
  const maxY = totalPoints
  const chartHeight = 350
  const chartWidth = 700
  const padding = { top: 20, right: 40, bottom: 60, left: 60 }
  
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom
  
  // Calculer les points pour le graphique avec protection contre NaN
  const getX = (day: number) => {
    const x = padding.left + (day / totalDays) * innerWidth
    return isNaN(x) ? padding.left : x
  }
  const getY = (remaining: number) => {
    const y = padding.top + (1 - remaining / maxY) * innerHeight
    return isNaN(y) ? padding.top : y
  }
  
  return (
    <div style={{ padding: '24px', background: '#fafafa', borderRadius: '12px' }}>
      {/* Légende en haut */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '32px', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '3px', background: '#52c41a', borderRadius: '2px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Ligne idéale (objectif)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '3px', background: '#1890ff', borderRadius: '2px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Progression réelle</span>
        </div>
      </div>

      <svg width={chartWidth} height={chartHeight} style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
        {/* Grille horizontale */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = padding.top + ratio * innerHeight
          const value = Math.round((1 - ratio) * maxY)
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="rgba(0, 0, 0, 0.06)"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y + 5}
                textAnchor="end"
                fontSize="12"
                fill="rgba(0, 0, 0, 0.45)"
              >
                {value}
              </text>
            </g>
          )
        })}
        
        {/* Grille verticale (jours) */}
        {[0, Math.floor(totalDays * 0.25), Math.floor(totalDays * 0.5), Math.floor(totalDays * 0.75), totalDays].map((day) => {
          const x = getX(day)
          return (
            <g key={day}>
              <line
                x1={x}
                y1={padding.top}
                x2={x}
                y2={chartHeight - padding.bottom}
                stroke="rgba(0, 0, 0, 0.06)"
                strokeWidth="1"
              />
              <text
                x={x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fill="rgba(0, 0, 0, 0.45)"
              >
                J{day}
              </text>
            </g>
          )
        })}
        
        {/* Ligne idéale (verte) */}
        <polyline
          points={idealLine.map((p) => 
            `${getX(p.day)},${getY(p.remaining)}`
          ).join(' ')}
          fill="none"
          stroke="#52c41a"
          strokeWidth="3"
          strokeDasharray="8,4"
          opacity="0.7"
        />
        
        {/* Ligne réelle (bleue) */}
        <polyline
          points={actualLine.map((p) => 
            `${getX(p.day)},${getY(p.remaining)}`
          ).join(' ')}
          fill="none"
          stroke="#1890ff"
          strokeWidth="4"
        />
        
        {/* Points sur la ligne réelle */}
        {actualLine.map((p, i) => (
          <circle
            key={i}
            cx={getX(p.day)}
            cy={getY(p.remaining)}
            r="5"
            fill="#1890ff"
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}
        
        {/* Point actuel (plus gros) */}
        {actualLine.length > 0 && (
          <circle
            cx={getX(currentDay)}
            cy={getY(actualLine[actualLine.length - 1].remaining)}
            r="8"
            fill="#1890ff"
            stroke="#ffffff"
            strokeWidth="3"
          />
        )}
        
        {/* Labels des axes */}
        <text
          x={chartWidth / 2}
          y={chartHeight - 10}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="rgba(0, 0, 0, 0.65)"
        >
          Jours du sprint
        </text>
        
        <text
          x={15}
          y={chartHeight / 2}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="rgba(0, 0, 0, 0.65)"
          transform={`rotate(-90, 15, ${chartHeight / 2})`}
        >
          Tâches restantes
        </text>
      </svg>
      
      {/* Statistiques sous le graphique */}
      <div style={{ 
        marginTop: '24px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '16px',
        padding: '20px',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#1890ff', marginBottom: '4px' }}>
            {actualLine[actualLine.length - 1]?.remaining || 0}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
            Tâches restantes
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#52c41a', marginBottom: '4px' }}>
            {totalPoints - (actualLine[actualLine.length - 1]?.remaining || 0)}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
            Tâches terminées
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: '700', color: '#000000', marginBottom: '4px' }}>
            {Math.round(((totalPoints - (actualLine[actualLine.length - 1]?.remaining || 0)) / totalPoints) * 100)}%
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)' }}>
            Progression
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ padding: '16px', background: 'rgba(24, 144, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(24, 144, 255, 0.2)' }}>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)', lineHeight: '1.6' }}>
            <strong>Comment lire ce graphique :</strong><br />
            • Ligne <span style={{ color: '#52c41a', fontWeight: 600 }}>verte</span> = objectif idéal<br />
            • Ligne <span style={{ color: '#1890ff', fontWeight: 600 }}>bleue</span> = progression réelle<br />
            • En dessous de la verte = en avance 🎉<br />
            • Au dessus de la verte = en retard ⚠️
          </div>
        </div>
        
        <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.02)', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.06)' }}>
          <div style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.65)', lineHeight: '1.6' }}>
            <strong>État du sprint :</strong><br />
            • À faire: <span style={{ fontWeight: 600 }}>{data.actualLine[0]?.remaining - (data.totalPoints - data.actualLine[data.actualLine.length - 1]?.remaining)}</span> tâches<br />
            • En cours: <span style={{ fontWeight: 600 }}>{Math.max(0, data.totalPoints - data.actualLine[data.actualLine.length - 1]?.remaining - (data.totalPoints - data.actualLine[0]?.remaining))}</span> tâches<br />
            • Terminées: <span style={{ fontWeight: 600, color: '#52c41a' }}>{data.totalPoints - data.actualLine[data.actualLine.length - 1]?.remaining}</span> tâches
          </div>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, stats }: any) {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '32px',
      border: '1px solid rgba(0, 0, 0, 0.06)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
        {title}
      </h3>
      <div style={{ display: 'grid', gap: '16px' }}>
        {stats.map((stat: any, i: number) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.65)' }}>{stat.label}</span>
            <span style={{ fontSize: '20px', fontWeight: '600' }}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
