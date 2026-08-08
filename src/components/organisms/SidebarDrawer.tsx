import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { config } from '../../config'
import {
  FaTachometerAlt, FaUsers, FaGraduationCap, FaAward,
  FaFileAlt, FaClipboardList, FaBookOpen, FaQuestionCircle, FaSignOutAlt, FaTimes, FaChartBar,
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

interface SidebarDrawerProps {
  open: boolean
  onClose: () => void
}

export default function SidebarDrawer({ open, onClose }: SidebarDrawerProps) {
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
    <div
      className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-bar-200 bg-bar-500 px-4 py-3">
        <img src="/logo.png" alt="InnovaSalud" className="h-20 w-auto" />
        <button onClick={onClose} className="rounded-lg p-1.5 text-white hover:bg-bar-400 transition-colors">
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {filtered.map((item) => {
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path + '/'))
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors ${
                active
                  ? 'bg-bar-50 text-bar-700'
                  : 'text-neutral-600 hover:bg-content-100 hover:text-bar-700'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-neutral-200 px-4 py-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bar-300 text-sm font-medium text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-neutral-900">{user?.name || 'Usuario'}</p>
            <p className="truncate text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-content-100 hover:text-bar-700 transition-colors"
        >
          <FaSignOutAlt className="h-5 w-5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
