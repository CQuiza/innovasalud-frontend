import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCourse } from '../hooks/useCourses'
import { useModules } from '../hooks/useModules'
import { useUsers } from '../hooks/useUsers'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import Skeleton from '../components/atoms/Skeleton'
import Badge from '../components/atoms/Badge'
import ImageLightbox from '../components/molecules/ImageLightbox'
import ModuleManager from '../components/organisms/course/ModuleManager'
import { config } from '../config'
import { FaArrowLeft, FaChalkboardTeacher, FaFileAlt, FaBookOpen, FaCalendarAlt } from 'react-icons/fa'
import { formatDate } from '../lib/dates'

export default function CourseDetailPage() {
  const { user } = useAuth()
  const { courseId } = useParams<{ courseId: string }>()
  const id = Number(courseId)
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)
  const { data: course, isLoading: loadingCourse } = useCourse(id)
  const { data: modules } = useModules({ course_id: id })
  const { data: users } = useUsers({ limit: 500 })
  const { data: certTypes } = useCertificateTypes({ limit: 2000 })

  if (loadingCourse) return <div className="p-6 lg:p-8"><Skeleton count={3} className="h-8 w-full" /></div>
  if (!course) return <div className="p-6 lg:p-8"><p className="text-muted">Curso no encontrado</p></div>

  const teacherName = course.teacher_id
    ? users?.items?.find((u) => u.id === course.teacher_id)?.name || users?.items?.find((u) => u.id === course.teacher_id)?.email || `ID: ${course.teacher_id}`
    : null

  const certTypeName = course.certificate_type_id
    ? certTypes?.find((t) => t.id === course.certificate_type_id)?.name || `ID: ${course.certificate_type_id}`
    : null

  return (
    <div className="p-6 lg:p-8">
      <Link to="/courses" className="d-inline-flex align-items-center gap-1 small fw-medium text-bar-600 text-decoration-none mb-3 hover-text-bar-700">
        <FaArrowLeft /> Volver a cursos
      </Link>

      <h1 className="fs-2 fw-bold text-neutral-800 mb-1">{course.title}</h1>
      {course.description && <p className="text-muted mb-4">{course.description}</p>}

      <div className="row g-4">
        <div className="col-12 col-xl-4 order-xl-2">
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm position-sticky" style={{ top: '1rem' }}>
            {course.preset_image ? (
              <ImageLightbox
                src={`/courses_images/${course.preset_image}.png`}
                alt={course.title}
                className="w-100 rounded-top"
                style={{ height: 160, objectFit: 'cover' }}
              />
            ) : course.image_url ? (
              <ImageLightbox
                src={`${config.apiUrl}/courses/${course.id}/image`}
                alt={course.title}
                className="w-100 rounded-top"
                style={{ height: 160, objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <ImageLightbox
                src="/default-course-image.png"
                alt={course.title}
                className="w-100 rounded-top"
                style={{ height: 160, objectFit: 'cover' }}
              />
            )}
            <div className="p-4">
            <h6 className="small fw-semibold text-muted text-uppercase mb-3">Información del curso</h6>
            <div className="space-y-2">
              <div className="d-flex align-items-center gap-2 small">
                <Badge variant={courseStatusVariant(course.status)}>{course.status}</Badge>
              </div>
              {teacherName && (
                <div className="d-flex align-items-center gap-2 small text-neutral-700">
                  <FaChalkboardTeacher className="text-bar-500 shrink-0" />
                  <span>{teacherName}</span>
                </div>
              )}
              {certTypeName && (
                <div className="d-flex align-items-center gap-2 small text-neutral-700">
                  <FaFileAlt className="text-bar-500 shrink-0" />
                  <span>{certTypeName}</span>
                </div>
              )}
              <div className="d-flex align-items-center gap-2 small text-neutral-700">
                <FaBookOpen className="text-bar-500 shrink-0" />
                <span>{modules?.length ?? 0} módulo{(modules?.length ?? 0) !== 1 ? 's' : ''}</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-neutral-700">
                <FaCalendarAlt className="text-bar-500 shrink-0" />
                <span>Creado {formatDate(course.created_at)}</span>
              </div>
              <div className="d-flex align-items-center gap-2 small text-neutral-700">
                <FaCalendarAlt className="text-bar-500 shrink-0" />
                <span>Actualizado {formatDate(course.updated_at)}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
        <div className="col-12 col-xl-8 order-xl-1">
          <ModuleManager courseId={id} canManage={!!canManage} />
        </div>
      </div>
    </div>
  )
}

function courseStatusVariant(status: string) {
  return status === 'published' ? 'success' as const : 'warning' as const
}
