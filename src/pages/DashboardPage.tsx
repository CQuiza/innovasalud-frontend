import { useAuth } from '../context/AuthContext'
import { useDashboardStats } from '../hooks/useDashboard'
import Card from '../components/molecules/Card'
import Skeleton from '../components/atoms/Skeleton'
import { FaUsers, FaAward, FaGraduationCap, FaFileAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa'

export default function DashboardPage() {
  const { user } = useAuth()
  const isStaff = user && ['superuser', 'admin', 'teacher'].includes(user.role)

  const { data: stats, isLoading } = useDashboardStats({ enabled: !!isStaff })

  const statsCards = [
    { label: 'Usuarios activos', value: stats?.total_users ?? null, icon: FaUsers, color: 'text-bar-600 bg-bar-50' },
    { label: 'Total certificados', value: stats?.total_certificates ?? null, icon: FaAward, color: 'text-success-600 bg-success-50' },
    { label: 'Cursos publicados', value: stats?.published_courses ?? null, icon: FaGraduationCap, color: 'text-warning-600 bg-warning-50' },
    { label: 'Tipos de certificado', value: stats?.certificate_types ?? null, icon: FaFileAlt, color: 'text-info-600 bg-info-50' },
  ]

  const certStatusCards = [
    { label: 'Activos', value: stats?.active_certificates ?? null, icon: FaCheckCircle, color: 'text-success-600 bg-success-50' },
    { label: 'Expirados', value: stats?.expired_certificates ?? null, icon: FaClock, color: 'text-warning-600 bg-warning-50' },
    { label: 'Revocados', value: stats?.revoked_certificates ?? null, icon: FaTimesCircle, color: 'text-danger-600 bg-danger-50' },
  ]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl fw-bold text-neutral-800">
          Hola, {user?.name || 'Usuario'}
        </h1>
        <p className="mt-1 small text-muted">
          Panel principal de la plataforma InnovaSalud
        </p>
      </div>

      <div className="d-flex flex-column flex-xl-row gap-4" style={{ maxWidth: '100%' }}>
        <div style={{ flex: '2 1 0%', minWidth: 0 }}>
          {isLoading ? (
            <div className="row g-3 mb-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-12 col-sm-6">
                  <Card><Skeleton count={2} className="h-4 w-100" /></Card>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="row g-3 mb-4">
                {statsCards.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="col-12 col-sm-6">
                      <Card>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`d-flex align-items-center justify-content-center rounded-3 ${stat.color}`} style={{ width: 48, height: 48 }}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="fs-4 fw-bold text-neutral-800 mb-0">{stat.value ?? '—'}</p>
                            <p className="small text-muted mb-0">{stat.label}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>

              <h2 className="mb-3 fs-5 fw-semibold text-neutral-800">Estado de Certificados</h2>
              <div className="row g-3">
                {certStatusCards.map((c) => {
                  const Icon = c.icon
                  return (
                    <div key={c.label} className="col-12 col-sm-4">
                      <Card>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`d-flex align-items-center justify-content-center rounded-3 ${c.color}`} style={{ width: 48, height: 48 }}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="fs-4 fw-bold text-neutral-800 mb-0">{c.value ?? '—'}</p>
                            <p className="small text-muted mb-0">{c.label}</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="d-none d-xl-block" style={{ flex: '1 1 0%', minWidth: 0 }}>
          <div className="position-sticky" style={{ top: '1rem' }}>
            <img
              src="/panel-bg.jpg"
              alt="Panel InnovaSalud"
              className="w-100 rounded-3 border shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
