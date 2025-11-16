import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Typography, Space, Input, Dropdown, Avatar, Flex, Badge, Tooltip } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, PlusOutlined, DownOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'
import { LayoutDashboard, KanbanSquare, Rocket, Users, Settings, Search } from 'lucide-react'
import NotificationCenter from '../../components/NotificationCenter'
import WorkspaceManager from '../../components/WorkspaceManager'
import GlobalSearch from '../../components/GlobalSearch'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'

export default function AppLayout() {
  const { user, logout, theme: appTheme, toggleTheme, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { Header, Sider, Content } = Layout
  const [collapsed, setCollapsed] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [workspaceManagerOpen, setWorkspaceManagerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Raccourci clavier Ctrl+K pour ouvrir la recherche
  useKeyboardShortcut({
    key: 'k',
    ctrl: true,
    callback: () => setSearchOpen(true)
  })

  useEffect(() => {
    if (token) {
      loadWorkspaces()
    }
  }, [token])

  const loadWorkspaces = async () => {
    try {
      const resp = await fetch('/api/workspaces', {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
      })
      if (resp.ok) {
        const data = await resp.json()
        setWorkspaces(Array.isArray(data) ? data : (data.data || []))
      }
    } catch (e) {
      console.error('Erreur chargement workspaces:', e)
    }
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <LayoutDashboard size={18} />,
      label: 'Projets',
    },
    {
      key: '/epics',
      icon: <LayoutDashboard size={18} />,
      label: 'Epics',
    },
    {
      key: '/kanban',
      icon: <KanbanSquare size={18} />,
      label: 'Kanban',
    },
    {
      key: '/roadmap',
      icon: <Rocket size={18} />,
      label: 'Roadmap',
    },
    {
      key: '/analytics',
      icon: <LayoutDashboard size={18} />,
      label: 'Analytics',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Utilisateurs',
    },
  ]

  const onMenuClick = (info) => { navigate(info.key) }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={260}
        breakpoint="lg"
        style={{ 
          position: 'fixed', 
          left: 0, 
          top: 0, 
          bottom: 0,
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border)'
        }}
      >
        <div style={{ 
          height: 72, 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 24px', 
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard size={20} style={{ color: 'white' }} />
            </div>
            {!collapsed && <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Agile</span>}
          </div>
        </div>

        {/* Workspaces Section */}
        {!collapsed && (
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mes Équipes ({workspaces.length})
                </span>
              </div>
              <button
                onClick={() => setWorkspaceManagerOpen(true)}
                style={{
                  width: '20px',
                  height: '20px',
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
                title="Gérer mes équipes"
              >
                <Settings size={12} />
              </button>
            </div>
            {workspaces.length > 0 && (
              <div>
                {workspaces.map((workspace) => (
              <div key={workspace.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-sm)', 
                background: 'var(--bg-hover)',
                marginBottom: '4px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: 'var(--success)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white'
                }}>
                  {workspace.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)' }}>
                  {workspace.name}
                </span>
                <Badge 
                  count="✓" 
                  style={{ 
                    backgroundColor: 'var(--success)', 
                    fontSize: '10px',
                    marginLeft: 'auto'
                  }} 
                />
              </div>
                ))}
              </div>
            )}
            {workspaces.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '16px',
                color: 'var(--text-muted)',
                fontSize: '13px'
              }}>
                Aucune équipe
              </div>
            )}
          </div>
        )}
        
        <Menu
          theme={appTheme === 'light' ? 'light' : 'dark'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={onMenuClick}
          style={{ 
            borderRight: 0, 
            background: 'transparent',
            padding: '16px 12px'
          }}
          className="modern-menu"
        />
        
        <div style={{ 
          position: 'absolute', 
          bottom: 0, 
          left: 0,
          right: 0,
          padding: '16px', 
          borderTop: '1px solid var(--border)', 
          background: 'var(--bg-card)',
          zIndex: 10
        }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', flexShrink: 0, overflow: 'hidden' }}>
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8005${user.avatar_url}`}
                      alt={user?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </div>
              </div>
              <button 
                onClick={toggleTheme} 
                style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s', flexShrink: 0 }}
              >
                {appTheme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', overflow: 'hidden' }}>
                {user?.avatar_url ? (
                  <img 
                    src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8005${user.avatar_url}`}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <button 
                onClick={toggleTheme} 
                style={{ width: '36px', height: '36px', border: 'none', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', transition: 'all 0.2s' }}
              >
                {appTheme === 'light' ? '🌙' : '☀️'}
              </button>
            </div>
          )}
        </div>
      </Sider>

      <Layout style={{ 
        marginLeft: collapsed ? 80 : 260, 
        transition: 'margin-left 0.2s ease', 
        background: 'var(--bg-page)',
        minHeight: '100vh'
      }}>
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 16, 
          background: 'var(--bg-card)', 
          borderBottom: '1px solid var(--border)', 
          position: 'sticky', 
          top: 0, 
          zIndex: 9,
          padding: '0 32px',
          height: 72
        }}>
          <Space style={{ flex: 1 }}>
            <Button 
              type="text" 
              onClick={() => setCollapsed(!collapsed)} 
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
            />
            
            {/* Bouton de recherche globale */}
            <Button
              type="text"
              icon={<Search size={18} />}
              onClick={() => setSearchOpen(true)}
              style={{
                height: '36px',
                borderRadius: '4px'
              }}
            />
          </Space>
          
          <Space size="middle">
            <NotificationCenter />
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              onClick={() => navigate('/settings')} 
            />
            
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: 'profile', label: 'Profil', onClick: () => navigate('/profile') },
                  { key: 'settings', label: 'Paramètres', onClick: () => navigate('/settings') },
                  { type: 'divider' },
                  { key: 'logout', label: 'Déconnexion', onClick: logout },
                ]
              }}
            >
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                border: 'none',
                background: 'transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600', overflow: 'hidden' }}>
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url.startsWith('http') ? user.avatar_url : `http://localhost:8005${user.avatar_url}`}
                      alt={user?.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text)' }}>{user?.name}</span>
              </button>
            </Dropdown>
            
          </Space>
        </Header>
        
        <Content style={{ 
          padding: '0', 
          background: 'var(--bg-page)',
          minHeight: 'calc(100vh - 72px)'
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Modal de gestion des équipes */}
      <WorkspaceManager 
        visible={workspaceManagerOpen}
        onClose={() => setWorkspaceManagerOpen(false)}
        onWorkspacesUpdated={loadWorkspaces}
      />

      <GlobalSearch 
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </Layout>
  )
}
