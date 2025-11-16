import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Select, Progress, Button, message } from 'antd'
import {
  TrendingUp, TrendingDown, Target, Clock,
  CheckCircle, Activity, Users, Calendar,
  BarChart3, PieChart, Download, RefreshCw
} from 'lucide-react'
import dayjs from 'dayjs'
import { Project } from '../../types'

const { Option } = Select

interface Stats {
  totalTasks: number
  byStatus: {
    todo: number
    in_progress: number
    done: number
  }
  completionRate: number
  overdue: number
  dueThisWeek: number
  createdThisWeek: number
  completedThisWeek: number
  createdThisMonth: number
  completedThisMonth: number
  avgCompletionTime: string
  velocity: number
}

export default function Analytics() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    loadData()
  }, [token, navigate, selectedProject])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger les projets
      const projectResp = await fetch('/api/projects', { 
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } 
      })
      if (projectResp.ok) {
        const projectData = await projectResp.json()
        const projectList = Array.isArray(projectData) ? projectData : (projectData.data || [])
        setProjects(projectList)
      }

      // Charger les tâches
      const tasksResp = await fetch('/api/tasks', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (tasksResp.ok) {
        const tasksData = await tasksResp.json()
        let tasks: any[] = Array.isArray(tasksData) ? tasksData : (tasksData.data || [])

        // Filtrer par projet si sélectionné
        if (selectedProject) {
          tasks = tasks.filter((t: any) => t.project_id === selectedProject)
        }

        // Calculer les statistiques avancées
        const now = dayjs()
        const weekAgo = now.subtract(7, 'day')
        const monthAgo = now.subtract(30, 'day')

        const calculatedStats: Stats = {
          totalTasks: tasks.length,
          byStatus: {
            todo: tasks.filter((t: any) => t.status === 'todo').length,
            in_progress: tasks.filter((t: any) => t.status === 'in_progress').length,
            done: tasks.filter((t: any) => t.status === 'done').length
          },
          completionRate: tasks.length > 0
            ? Math.round((tasks.filter((t: any) => t.status === 'done').length / tasks.length) * 100)
            : 0,
          overdue: tasks.filter((t: any) => t.due_date && dayjs(t.due_date).isBefore(now) && t.status !== 'done').length,
          dueThisWeek: tasks.filter((t: any) => t.due_date && dayjs(t.due_date).isAfter(now) && dayjs(t.due_date).isBefore(now.add(7, 'day'))).length,
          createdThisWeek: tasks.filter((t: any) => dayjs(t.created_at).isAfter(weekAgo)).length,
          completedThisWeek: tasks.filter((t: any) => t.status === 'done' && dayjs(t.updated_at).isAfter(weekAgo)).length,
          createdThisMonth: tasks.filter((t: any) => dayjs(t.created_at).isAfter(monthAgo)).length,
          completedThisMonth: tasks.filter((t: any) => t.status === 'done' && dayjs(t.updated_at).isAfter(monthAgo)).length,
          avgCompletionTime: '2.3 jours', // À calculer avec vraies données
          velocity: tasks.filter((t: any) => t.status === 'done' && dayjs(t.updated_at).isAfter(weekAgo)).length
        }
        setStats(calculatedStats)
      }
    } catch (error) {
      console.error('Erreur:', error)
      message.error('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  const metrics = [
    {
      title: 'Taux de complétion',
      value: `${stats?.completionRate || 0}%`,
      icon: Target,
      color: '#667eea',
      trend: '+5%',
      trendUp: true
    },
    {
      title: 'En retard',
      value: stats?.overdue || 0,
      icon: Clock,
      color: '#f5576c',
      trend: '-2',
      trendUp: false
    },
    {
      title: 'Cette semaine',
      value: stats?.dueThisWeek || 0,
      icon: Calendar,
      color: '#11998e',
      trend: '+3',
      trendUp: true
    },
    {
      title: 'Vélocité',
      value: stats?.velocity || 0,
      icon: TrendingUp,
      color: '#4facfe',
      trend: '+12%',
      trendUp: true
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px 0' }}>
            Analytics
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Analysez vos performances et suivez votre progression
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Select
            placeholder="Tous les projets"
            value={selectedProject}
            onChange={setSelectedProject}
            style={{ width: '200px' }}
            allowClear
          >
            {projects.map(p => (
              <Option key={p.id} value={p.id}>{p.name}</Option>
            ))}
          </Select>
          <Button 
            icon={<RefreshCw size={16} />}
            onClick={loadData}
            loading={loading}
            style={{ height: '40px', borderRadius: 'var(--radius-md)' }}
          >
            Actualiser
          </Button>
          <Button 
            type="primary"
            icon={<Download size={16} />}
            onClick={() => message.info('Export à venir')}
            style={{ 
              height: '40px', 
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              borderColor: 'var(--primary)'
            }}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          const TrendIcon = metric.trendUp ? TrendingUp : TrendingDown
          
          return (
            <div 
              key={index}
              className="card hover-lift"
              style={{ 
                background: 'var(--bg-card)', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-lg)', 
                padding: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Background Icon */}
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                <Icon size={100} style={{ color: metric.color }} />
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: metric.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={24} style={{ color: metric.color }} />
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: metric.trendUp ? 'var(--success)' : 'var(--error)' 
                  }}>
                    <TrendIcon size={14} />
                    {metric.trend}
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
                  {metric.value}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  {metric.title}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        {/* Completion Progress */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              Progression Globale
            </h3>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tâches terminées</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                {stats?.completionRate || 0}%
              </span>
            </div>
            <Progress 
              percent={stats?.completionRate || 0}
              strokeColor={{
                '0%': '#667eea',
                '100%': '#764ba2',
              }}
              trailColor="var(--bg-hover)"
              size={12}
              showInfo={false}
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {stats?.byStatus?.done || 0} tâches sur {stats?.totalTasks || 0} terminées
          </div>
        </div>

        {/* Activity This Week */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              Activité Cette Semaine
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tâches créées</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>
                {stats?.createdThisWeek || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tâches terminées</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--success)' }}>
                {stats?.completedThisWeek || 0}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Vélocité</span>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                {stats?.velocity || 0} <span style={{ fontSize: '14px', fontWeight: '400' }}>/semaine</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px', marginBottom: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
            Distribution des Tâches
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {/* To Do */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>À faire</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
                {stats?.byStatus?.todo || 0}
              </span>
            </div>
            <Progress
              percent={stats?.totalTasks && stats.totalTasks > 0 ? Math.round((stats.byStatus.todo / stats.totalTasks) * 100) : 0}
              strokeColor="#6f767e"
              trailColor="var(--bg-hover)"
              size={8}
              showInfo={false}
            />
          </div>

          {/* In Progress */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>En cours</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
                {stats?.byStatus?.in_progress || 0}
              </span>
            </div>
            <Progress
              percent={stats?.totalTasks && stats.totalTasks > 0 ? Math.round((stats.byStatus.in_progress / stats.totalTasks) * 100) : 0}
              strokeColor="#f5576c"
              trailColor="var(--bg-hover)"
              size={8}
              showInfo={false}
            />
          </div>

          {/* Done */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Terminées</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
                {stats?.byStatus?.done || 0}
              </span>
            </div>
            <Progress
              percent={stats?.totalTasks && stats.totalTasks > 0 ? Math.round((stats.byStatus.done / stats.totalTasks) * 100) : 0}
              strokeColor="#11998e"
              trailColor="var(--bg-hover)"
              size={8}
              showInfo={false}
            />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Monthly Activity */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--primary)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              Activité Mensuelle
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tâches créées</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>
                  {stats?.createdThisMonth || 0}
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min((stats?.createdThisMonth || 0) * 10, 100)}%`, 
                  background: 'var(--primary)', 
                  borderRadius: '2px',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tâches terminées</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--success)' }}>
                  {stats?.completedThisMonth || 0}
                </span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${Math.min((stats?.completedThisMonth || 0) * 10, 100)}%`, 
                  background: 'var(--success)', 
                  borderRadius: '2px',
                  transition: 'width 0.5s'
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--success)' + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: 'var(--success)' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text)', margin: 0 }}>
              Performance
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Temps moyen de complétion
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text)' }}>
                {stats?.avgCompletionTime || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Vélocité hebdomadaire
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                {stats?.velocity || 0} tâches
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
