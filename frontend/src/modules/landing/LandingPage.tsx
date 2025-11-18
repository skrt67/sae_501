import { useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowRight, CheckCircle, Users, Calendar, BarChart3, Zap, Target, Shield } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="theme-light" style={{ minHeight: '100vh', background: '#ffffff' }}>
      {/* Header */}
      <header style={{
        padding: '24px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        background: '#ffffff',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: '#000000',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#ffffff', fontSize: '20px', fontWeight: '900' }}>A</span>
          </div>
          <h1 style={{ color: '#000000', fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Asano
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="default"
            onClick={() => navigate('/login')}
            style={{
              background: 'transparent',
              color: '#000000',
              border: '1px solid #e0e0e0',
              height: '40px',
              fontWeight: '500'
            }}
          >
            Connexion
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/register')}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              height: '40px',
              fontWeight: '600'
            }}
          >
            S'inscrire
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '120px 48px 100px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '200px',
          height: '200px',
          border: '1px solid #f0f0f0',
          borderRadius: '50%',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '40%',
          right: '15%',
          width: '100px',
          height: '100px',
          background: '#f5f5f5',
          transform: 'rotate(45deg)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: '82px',
            fontWeight: '900',
            color: '#000000',
            marginBottom: '32px',
            lineHeight: '1.05',
            letterSpacing: '-3px',
            maxWidth: '900px',
            margin: '0 auto 32px'
          }}>
            Transformez votre gestion de projets
          </h1>

          <p style={{
            fontSize: '21px',
            color: '#666666',
            marginBottom: '56px',
            maxWidth: '650px',
            margin: '0 auto 56px',
            lineHeight: '1.7',
            fontWeight: '400'
          }}>
            La solution complète pour gérer vos projets en Scrum & Kanban.
            Visualisez, planifiez et collaborez efficacement avec votre équipe.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '64px' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/register')}
              icon={<ArrowRight size={20} />}
              style={{
                background: '#000000',
                color: '#ffffff',
                height: '52px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 32px',
                borderRadius: '4px'
              }}
              className="hover-lift"
            >
              Commencer gratuitement
            </Button>
          </div>


        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '100px 48px',
        background: '#fafafa',
        borderTop: '1px solid #e0e0e0',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#000000',
              textTransform: 'uppercase',
              letterSpacing: '1.5px'
            }}>
              FONCTIONNALITÉS
            </span>
            <h2 style={{
              fontSize: '52px',
              fontWeight: '800',
              marginTop: '20px',
              marginBottom: '20px',
              color: '#000000',
              letterSpacing: '-1.5px'
            }}>
              Tout ce dont vous avez besoin
            </h2>
            <p style={{
              fontSize: '19px',
              color: '#666666',
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              Une suite complète d'outils pour gérer vos projets agiles du début à la fin
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <CheckCircle size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Kanban Board
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Visualisez et gérez vos tâches avec un tableau Kanban intuitif. Drag & drop fluide et organisation par colonnes.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <Calendar size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Sprints & Roadmap
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Planifiez vos sprints et visualisez votre roadmap. Timeline interactive et suivi de progression en temps réel.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <Users size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Collaboration d'équipe
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Travaillez ensemble efficacement. Gestion des rôles, invitations, assignations et notifications en temps réel.
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <BarChart3 size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Analytics & Reporting
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Dashboards personnalisés avec métriques clés. Suivez la vélocité, le burndown et les performances de l'équipe.
              </p>
            </div>

            {/* Feature 5 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <Zap size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Performance rapide
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Interface ultra-rapide et réactive. Chargement instantané et synchronisation en temps réel pour une productivité maximale.
              </p>
            </div>

            {/* Feature 6 */}
            <div style={{
              padding: '48px 40px',
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer'
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#000000'
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e0e0e0'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                background: '#000000',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '28px'
              }}>
                <Shield size={32} color="#ffffff" strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#000000' }}>
                Sécurité avancée
              </h3>
              <p style={{ color: '#666666', lineHeight: '1.8', fontSize: '15px', margin: 0 }}>
                Vos données sont protégées avec un chiffrement de niveau entreprise. Authentification sécurisée et permissions granulaires.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '120px 48px',
        background: '#000000',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'linear-gradient(#1a1a1a 1px, transparent 1px), linear-gradient(90deg, #1a1a1a 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.3
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '56px',
            fontWeight: '900',
            marginBottom: '28px',
            color: '#ffffff',
            letterSpacing: '-2px',
            lineHeight: '1.1'
          }}>
            Prêt à transformer votre gestion de projets ?
          </h2>
          <p style={{
            fontSize: '20px',
            color: '#cccccc',
            marginBottom: '56px',
            lineHeight: '1.7',
            maxWidth: '600px',
            margin: '0 auto 56px'
          }}>
            Rejoignez des équipes qui utilisent Asano pour gérer leurs projets agiles efficacement
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/register')}
              style={{
                background: '#ffffff',
                color: '#000000',
                height: '56px',
                fontSize: '17px',
                fontWeight: '700',
                border: 'none',
                padding: '0 48px',
                borderRadius: '4px'
              }}
            >
              Commencer gratuitement
            </Button>
            <Button
              size="large"
              onClick={() => navigate('/login')}
              style={{
                background: 'transparent',
                color: '#ffffff',
                height: '56px',
                fontSize: '17px',
                fontWeight: '600',
                border: '1px solid #666666',
                padding: '0 48px',
                borderRadius: '4px'
              }}
            >
              Se connecter
            </Button>
          </div>
          <p style={{
            fontSize: '14px',
            color: '#999999',
            marginTop: '40px',
            fontWeight: '500'
          }}>
            Aucune carte bancaire requise • Configuration en 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '80px 48px 40px',
        background: '#ffffff',
        borderTop: '1px solid #e0e0e0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px',
            marginBottom: '64px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  background: '#000000',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: '900' }}>A</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: 0 }}>
                  Asano
                </h3>
              </div>
              <p style={{ color: '#666666', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                Gestion de projets agile simplifiée pour les équipes modernes
              </p>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Entreprise
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="/about" style={{ color: '#666666', textDecoration: 'none', fontSize: '14px', transition: 'color 0.2s' }}
                   onMouseEnter={(e) => e.currentTarget.style.color = '#000000'}
                   onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}>
                  À propos
                </a>
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '32px',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{ color: '#000000', margin: 0, fontSize: '14px', fontWeight: '500' }}>
              Réalisé par DEPELI Altan
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
