import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Layout, Menu, Button, Typography, Space, Input, Dropdown, Avatar, Flex, Badge, Tooltip } from 'antd'
import { MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, PlusOutlined, DownOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons'
import { LayoutDashboard, KanbanSquare, Rocket, Users, Settings, FolderKanban, Layers, BarChart3, Search, Activity } from 'lucide-react'
import NotificationCenter from '../../components/NotificationCenter'
import EmailVerificationBanner from '../../components/EmailVerificationBanner'

export default function AppLayout() {
  const { user, logout, token } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { Header, Sider, Content } = Layout
  const [collapsed, setCollapsed] = useState(false)

  const menuItems = [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/projects',
      icon: <FolderKanban size={18} />,
      label: 'Projets',
    },
    {
      key: '/epics',
      icon: <Layers size={18} />,
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
      key: '/tasks/search',
      icon: <Search size={18} />,
      label: 'Recherche',
    },
    {
      key: '/analytics',
      icon: <BarChart3 size={18} />,
      label: 'Analytics',
    },
    {
      key: '/activities',
      icon: <Activity size={18} />,
      label: 'Activités',
    },
    {
      key: '/users',
      icon: <Users size={18} />,
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
        trigger={null}
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
            {!collapsed && <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>Asano</span>}
          </div>
        </div>


        <Menu
          theme="light"
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
          </Space>
          
          <Space size="middle">
            <NotificationCenter />
            
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
          <EmailVerificationBanner />
          <Outlet />
        </Content>
      </Layout>


    </Layout>
  )
}
