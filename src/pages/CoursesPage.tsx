import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useCourses, useCreateCourse, useUpdateCourse, useUploadCourseImage } from '../hooks/useCourses'
import { useUsers } from '../hooks/useUsers'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import Card from '../components/molecules/Card'
import SearchBar from '../components/molecules/SearchBar'
import Pagination from '../components/molecules/Pagination'
import Button from '../components/atoms/Button'
import Skeleton from '../components/atoms/Skeleton'
import CourseCard from '../components/organisms/course/CourseCard'
import CourseFormModal from '../components/organisms/course/CourseFormModal'
import { FaPlus } from 'react-icons/fa'
import { getErrorMessage } from '../lib/error'
import type { Course } from '../types'

const PAGE_SIZE = 12

export default function CoursesPage() {
  const { user } = useAuth()
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)

  const { data: courses, isLoading } = useCourses()
  const { data: users } = useUsers({ role: 'teacher', limit: 500 })
  const { data: certTypes } = useCertificateTypes({ limit: 2000 })
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse(editing?.id ?? 0)
  const uploadImage = useUploadCourseImage()

  const teacherMap = useMemo(() => {
    const list = users?.items
    if (!list) return {} as Record<number, string>
    return Object.fromEntries(list.map((u) => [u.id, u.name || u.email]))
  }, [users])

  const certTypeMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.name]))
  }, [certTypes])

  const filtered = useMemo(() => {
    if (!courses) return []
    const q = search.toLowerCase()
    return courses.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    )
  }, [courses, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() { setEditing(null); setModalOpen(true) }
  function openEdit(c: Course) { setEditing(c); setModalOpen(true) }

  async function handleSubmit(data: { title: string; description: string; status: string; teacher_id: number; certificate_type_id: number; imageFile: File | null; presetImage: string | null }) {
    const payload = {
      title: data.title,
      description: data.description || null,
      status: data.status as Course['status'],
      teacher_id: data.teacher_id || null,
      certificate_type_id: data.certificate_type_id || null,
      ...(data.presetImage ? { preset_image: data.presetImage } : {}),
    }
    try {
      let course: Course
      if (editing) {
        course = await updateCourse.mutateAsync(payload) as unknown as Course
        if (data.imageFile) {
          await uploadImage.mutateAsync({ courseId: course.id, file: data.imageFile })
        }
        toast.success('Curso actualizado correctamente')
      } else {
        course = await createCourse.mutateAsync(payload) as unknown as Course
        if (data.imageFile) {
          await uploadImage.mutateAsync({ courseId: course.id, file: data.imageFile })
        }
        toast.success('Curso creado correctamente')
      }
      setModalOpen(false); setEditing(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="fs-2 fw-bold text-neutral-800 mb-0">Cursos</h1>
          <p className="small text-muted mb-0">Administra los cursos de la plataforma</p>
        </div>
        {canManage && <Button onClick={openCreate}><FaPlus className="me-1" /> Nuevo curso</Button>}
      </div>

      <div className="d-flex flex-column flex-xl-row gap-4" style={{ maxWidth: '100%' }}>
        <div style={{ flex: '2 1 0%', minWidth: 0 }}>
          <Card padding={false}>
            <div className="border-bottom px-3 py-3">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Buscar curso..." />
            </div>

            {isLoading ? (
              <div className="p-4">
                <div className="row g-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="col-12 col-md-6">
                      <div className="rounded-xl border border-neutral-200 bg-white p-5">
                        <Skeleton count={3} className="h-4 w-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : pageData.length === 0 ? (
              <div className="text-center py-5 small text-muted">No se encontraron cursos.</div>
            ) : (
              <>
                <div className="p-4">
                  <div className="row g-3">
                    {pageData.map((c) => (
                      <div key={c.id} className="col-12 col-md-6">
                        <CourseCard
                          course={c}
                          teacherName={c.teacher_id ? teacherMap[c.teacher_id] || null : null}
                          certTypeName={c.certificate_type_id ? certTypeMap[c.certificate_type_id] || null : null}
                          canManage={!!canManage}
                          onEdit={openEdit}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </Card>
        </div>

        <div className="d-none d-xl-block" style={{ flex: '1 1 0%', minWidth: 0 }}>
          <div className="position-sticky" style={{ top: '1rem' }}>
            <img
              src="/cursos-bg.jpg"
              alt="Cursos"
              className="w-100 rounded-3 border shadow-sm"
            />
          </div>
        </div>
      </div>

      <CourseFormModal
        key={editing?.id ?? 'new-course'}
        open={modalOpen}
        editing={editing}
        users={users?.items}
        certTypes={certTypes}
        loading={createCourse.isPending || updateCourse.isPending || uploadImage.isPending}
        onSubmit={handleSubmit}
        onClose={() => { setModalOpen(false); setEditing(null) }}
      />
    </div>
  )
}
