import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, setRefreshToken } from '../services/authService'
import type { User } from '../types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getInitialUser(): User | null {
  localStorage.removeItem('user')
  const uid = localStorage.getItem('_uid')
  const role = localStorage.getItem('_role')
  if (!uid || !role) return null
  return { id: Number(uid), role } as User
}

function persistUser(user: User) {
  localStorage.setItem('_uid', String(user.id))
  localStorage.setItem('_role', user.role)
}

function clearPersistedUser() {
  localStorage.removeItem('_uid')
  localStorage.removeItem('_role')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      authService.getMe<User>()
        .then((u) => { setUser(u); persistUser(u) })
        .catch(() => { setUser(null); clearPersistedUser(); setRefreshToken(null) })
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const token = await authService.login({ username: email, password })
      setRefreshToken(token.refresh_token ?? null)

      let u: User | null = null
      try {
        u = await authService.getMe<User>()
      } catch {
        setRefreshToken(null)
        throw new Error('No se pudo obtener la información del usuario')
      }

      if (u) {
        persistUser(u)
      }
      setUser(u)

      if (!u) {
        navigate('/login')
        return
      }

      const role = u.role
      if (role === 'superuser' || role === 'admin') {
        navigate('/dashboard')
      } else if (role === 'teacher') {
        navigate('/courses')
      } else {
        navigate('/certificates')
      }
    },
    [navigate],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // ignora errores de logout, igual limpiamos sesión local
    }
    setRefreshToken(null)
    clearPersistedUser()
    setUser(null)
    navigate('/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
