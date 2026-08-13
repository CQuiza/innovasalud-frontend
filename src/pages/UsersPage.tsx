import { useState, useMemo, useEffect } from 'react'
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers'
import { useEnrollments, useCreateEnrollment, useDeleteEnrollment } from '../hooks/useEnrollments'
import { useCourses } from '../hooks/useCourses'
import Card from '../components/molecules/Card'
import DataTable from '../components/molecules/DataTable'
import SearchBar from '../components/molecules/SearchBar'
import SearchableSelect from '../components/molecules/SearchableSelect'
import Pagination from '../components/molecules/Pagination'
import Modal from '../components/molecules/Modal'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Skeleton from '../components/atoms/Skeleton'
import { toast } from 'sonner'
import { FaPlus, FaPencilAlt, FaTrashAlt, FaGraduationCap, FaTimes } from 'react-icons/fa'
import { getErrorMessage } from '../lib/error'
import { formatDate } from '../lib/dates'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { config } from '../config'
import UserFormModal from '../components/organisms/UserFormModal'
import type { User, CourseEnrollment, UserCreate } from '../types'

const PAGE_SIZE = 10

export default function UsersPage() {
  const { user } = useAuth()
  const isSuperuser = user?.role === 'superuser'

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [formUser, setFormUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const skip = (page - 1) * PAGE_SIZE
  const { data: users, isLoading } = useUsers(
    { skip, limit: PAGE_SIZE, search: debouncedSearch || undefined },
    { enabled: true },
  )
  const createUser = useCreateUser()
  const deleteUser = useDeleteUser()
  const updateUser = useUpdateUser(formUser?.id ?? 0)

  const [enrollUserId, setEnrollUserId] = useState<number | null>(null)
  const enrollUser = users?.items?.find((u) => u.id === enrollUserId)
  const { data: enrollments, isLoading: loadingEnroll } = useEnrollments(
    { user_id: enrollUserId ?? 0 }, { enabled: enrollUserId !== null }
  )
  const { data: courses } = useCourses()
  const [selectedCourseId, setSelectedCourseId] = useState<string | number>('')
  const createEnrollment = useCreateEnrollment()
  const deleteEnrollment = useDeleteEnrollment()
  const courseMap = useMemo(() => {
    if (!courses) return {} as Record<number, string>
    return Object.fromEntries(courses.map((c) => [c.id, c.title]))
  }, [courses])
  const enrolledCourseIds = useMemo(() => new Set(enrollments?.map((e) => e.course_id) ?? []), [enrollments])

  const courseOptions = useMemo(() =>
    (courses || []).filter((c) => c.status === 'published' && !enrolledCourseIds.has(c.id)).map((c) => ({
      value: c.id, label: c.title, sublabel: c.status,
    })),
    [courses, enrolledCourseIds],
  )

  const totalPages = Math.ceil((users?.total ?? 0) / PAGE_SIZE)
  const pageData = users?.items ?? []

  function openCreate() { setFormUser(null) }
  function openEdit(u: User) { setFormUser(u) }

  async function handleFormSubmit(data: Record<string, unknown>, mode: 'create' | 'edit') {
    try {
      if (mode === 'edit') {
        const res = await updateUser.mutateAsync(data as Parameters<typeof updateUser.mutateAsync>[0])
        const n = res?.certificates_regenerated ?? 0
        toast.success(
          n > 0
            ? `Usuario actualizado correctamente · ${n} certificado${n !== 1 ? 's' : ''} actualizado${n !== 1 ? 's' : ''}`
            : 'Usuario actualizado correctamente',
        )
      } else {
        await createUser.mutateAsync(data as unknown as UserCreate)
        toast.success('Usuario creado correctamente')
      }
      setFormUser(undefined)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  async function handleDelete(u: User) {
    if (!confirm(`¿Eliminar a ${u.name || u.email}?`)) return
    try {
      await deleteUser.mutateAsync(u.id)
      toast.success(`Usuario ${u.email} eliminado exitosamente.`)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  const columns = [
    { key: 'name', header: 'Nombre', align: 'left' as const, render: (u: User) => (
      <div><Link to={`/users/${u.id}/certificates`} className="fw-medium text-neutral-800 text-decoration-none">{u.name} {u.first_last_name}</Link><br /><small className="text-muted">{u.email}</small></div>
    )},
    { key: 'identity_number', header: 'Identificación', align: 'left' as const },
    { key: 'role', header: 'Rol', render: (u: User) => {
      const variant = u.role === 'superuser' || u.role === 'admin' ? 'info' : u.role === 'teacher' ? 'warning' : 'default'
      return <Badge variant={variant as 'info' | 'warning' | 'default'}>{u.role}</Badge>
    }},
    { key: 'is_active', header: 'Estado', render: (u: User) => <Badge variant={u.is_active ? 'success' : 'danger'}>{u.is_active ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'actions' as string, header: 'Acciones', render: (u: User) => (
      <div className="d-flex justify-content-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); openEdit(u) }} className="btn btn-sm btn-outline-secondary"><FaPencilAlt /></button>
        <button onClick={(e) => { e.stopPropagation(); handleDelete(u) }} className="btn btn-sm btn-outline-danger"><FaTrashAlt /></button>
        <button onClick={(e) => { e.stopPropagation(); setEnrollUserId(u.id); setSelectedCourseId('') }} className="btn btn-sm btn-outline-secondary" title="Asignar cursos"><FaGraduationCap /></button>
      </div>
    )},
  ]

  const roleOptions = useMemo(() => {
    const roles = [{ value: 'student', label: 'Estudiante' }]
    if (isSuperuser && config.showTeacherRole) roles.push({ value: 'teacher', label: 'Docente' })
    roles.push({ value: 'admin', label: 'Admin' })
    if (isSuperuser) roles.push({ value: 'superuser', label: 'Superusuario' })
    return roles
  }, [isSuperuser])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="fs-2 fw-bold text-neutral-800 mb-0">Usuarios</h1>
          <p className="small text-muted mb-0">Gestiona los usuarios de la plataforma</p>
        </div>
        <Button onClick={openCreate}><FaPlus className="me-1" /> Nuevo usuario</Button>
      </div>

      <Card padding={false}>
        <div className="border-bottom px-3 py-3">
          <SearchBar value={search} onChange={(v) => { setSearch(v) }} placeholder="Buscar por nombre, email o identificación..." />
        </div>
        {isLoading ? (
          <div className="p-4"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : (
          <>
            <DataTable columns={columns} data={pageData} />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </Card>

      <UserFormModal isOpen={formUser !== undefined} onClose={() => setFormUser(undefined)} user={formUser ?? null} roleOptions={roleOptions} isSaving={createUser.isPending || updateUser.isPending} onSubmit={handleFormSubmit} />

      <Modal open={!!enrollUserId} onClose={() => setEnrollUserId(null)} title={enrollUser ? `Cursos de ${enrollUser.name || enrollUser.email}` : 'Cursos'}>
        {loadingEnroll ? (
          <div className="p-2"><Skeleton count={3} className="h-10 w-full" /></div>
        ) : (
          <div>
            {enrollments && enrollments.length > 0 ? (
              <div className="mb-3">
                {enrollments.map((enr: CourseEnrollment) => (
                  <div key={enr.id} className="d-flex align-items-center justify-content-between border rounded-2 px-3 py-2 mb-2">
                    <div>
                      <p className="small fw-medium mb-0">{courseMap[enr.course_id] || `Curso #${enr.course_id}`}</p>
                      <small className="text-muted">Inscrito el {formatDate(enr.enrolled_at, { fallback: '' })}</small>
                    </div>
                    <button onClick={() => deleteEnrollment.mutateAsync(enr.id).catch((err) => toast.error(getErrorMessage(err)))} className="btn btn-sm btn-outline-danger"><FaTimes /></button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small text-muted mb-3">Este usuario no tiene cursos asignados.</p>
            )}
            <div className="border-top pt-3">
              <label className="form-label small fw-medium text-secondary">Asignar nuevo curso</label>
              <div className="d-flex gap-2">
                <div className="flex-grow-1"><SearchableSelect options={courseOptions} value={selectedCourseId} onChange={setSelectedCourseId} placeholder="Buscar curso..." /></div>
                <Button onClick={() => { if (!enrollUserId || !selectedCourseId) return; createEnrollment.mutateAsync({ user_id: enrollUserId, course_id: Number(selectedCourseId) }).then(() => { setSelectedCourseId(''); toast.success('Curso asignado correctamente') }).catch((err) => toast.error(getErrorMessage(err))) }} disabled={!selectedCourseId} loading={createEnrollment.isPending}>Asignar</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
