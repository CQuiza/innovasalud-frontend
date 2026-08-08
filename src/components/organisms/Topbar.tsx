import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { config } from '../../config'
import {
  FaBars, FaTachometerAlt, FaUsers, FaGraduationCap, FaAward,
  FaFileAlt, FaClipboardList, FaBookOpen, FaQuestionCircle, FaSignOutAlt, FaChartBar,
} from 'react-icons/fa'
import type { UserRole } from '../../types'
import type { IconType } from 'react-icons'

interface NavItem {
  label: string
  path: string
  icon: IconType
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { label: 'Panel', path: '/dashboard', icon: FaTachometerAlt, roles: ['superuser', 'admin', 'teacher'] },
  { label: 'Usuarios', path: '/users', icon: FaUsers, roles: ['superuser', 'admin'] },
  { label: 'Cursos', path: '/courses', icon: FaGraduationCap, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Certificados', path: '/certificates', icon: FaAward, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Progreso', path: '/progress', icon: FaChartBar, roles: ['superuser', 'admin', 'teacher', 'student'] },
  { label: 'Tipos', path: '/certificate-types', icon: FaFileAlt, roles: ['superuser', 'admin'] },
  { label: 'Auditoría', path: '/audit', icon: FaClipboardList, roles: ['superuser', 'admin'] },
  { label: 'Manual', path: '/manual', icon: FaBookOpen, roles: ['superuser', 'admin'] },
  { label: 'FAQ', path: '/faq', icon: FaQuestionCircle, roles: ['superuser', 'admin', 'teacher', 'student'] },
]

interface TopbarProps {
  onMenuClick: () => void
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const filtered = navItems.filter((item) => {
    if (!user) return false
    if (!item.roles.includes(user.role)) return false
    if (config.hideCoursesForAdmin && user.role === 'admin' && item.path === '/courses') return false
    return true
  })

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-bar-200 bg-bar-500 px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center rounded-lg p-2 text-white hover:bg-bar-400 transition-colors xl:hidden"
        >
          <FaBars className="h-5 w-5" />
        </button>
        <Link to="/">
          <img src="/logo.png" alt="InnovaSalud" className="h-23 w-auto object-contain" />
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-1 overflow-x-auto flex-1 mx-2">
        {filtered.map((item) => {
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-bar-400 text-white shadow-sm'
                  : 'text-white hover:bg-bar-400/70 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1.5 pe-2 border-r border-bar-400">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-bar-300 text-xs font-bold text-white shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden lg:block leading-tight">
            <span className="text-sm font-medium text-white">{user?.name || 'Usuario'}</span>
            <span className="text-[10px] text-bar-200 capitalize ms-1">· {user?.role}</span>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-bar-100 hover:bg-bar-400 hover:text-white transition-colors"
          title="Cerrar sesión"
        >
          <FaSignOutAlt className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
