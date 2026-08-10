import { useState } from 'react'
import { Link } from 'react-router-dom'
import Badge from '../../atoms/Badge'
import ImageLightbox from '../../molecules/ImageLightbox'
import { FaEye, FaPencilAlt, FaChalkboardTeacher, FaFileAlt } from 'react-icons/fa'
import { config } from '../../../config'
import type { Course } from '../../../types'

interface CourseCardProps {
  course: Course
  teacherName: string | null
  certTypeName: string | null
  canManage: boolean
  onEdit: (course: Course) => void
}

function CourseImage({ course }: { course: Course }) {
  const [error, setError] = useState(false)
  if (course.preset_image) {
    return (
      <ImageLightbox
        src={`/courses_images/${course.preset_image}.png`}
        alt={course.title}
        className="w-100 rounded-top"
        style={{ height: 140, objectFit: 'cover' }}
      />
    )
  }
  if (!course.image_url || error) {
    return (
      <ImageLightbox
        src="/default-course-image.png"
        alt={course.title}
        className="w-100 rounded-top"
        style={{ height: 140, objectFit: 'cover' }}
      />
    )
  }
  return (
    <ImageLightbox
      src={`${config.apiUrl}/courses/${course.id}/image`}
      alt={course.title}
      className="w-100 rounded-top"
      style={{ height: 140, objectFit: 'cover' }}
      onError={() => setError(true)}
    />
  )
}

export default function CourseCard({ course, teacherName, certTypeName, canManage, onEdit }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition-shadow d-flex flex-column">
      <CourseImage course={course} />
      <div
        className="p-5 d-flex flex-column flex-grow-1"
        style={{ cursor: course.description ? 'pointer' : undefined }}
        onClick={() => course.description && setExpanded(!expanded)}
      >
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="min-w-0 flex-grow-1">
            <h3 className="h6 fw-bold text-neutral-800 mb-1">{course.title}</h3>
            {course.description && (
              <p
                className="small text-muted mb-0"
                style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {course.description}
                {!expanded && <span className="text-bar-500 fw-medium ms-1">ver más</span>}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto space-y-1">
          <div className="d-flex align-items-center gap-2 small text-neutral-600">
            <Badge variant={courseStatusVariant(course.status)}>{course.status}</Badge>
          </div>
          {teacherName && (
            <div className="d-flex align-items-center gap-2 small text-neutral-600">
              <FaChalkboardTeacher className="text-bar-400 shrink-0" style={{ width: 12, height: 12 }} />
              <span className="text-truncate">{teacherName}</span>
            </div>
          )}
          {certTypeName && (
            <div className="d-flex align-items-center gap-2 small text-neutral-600">
              <FaFileAlt className="text-bar-400 shrink-0" style={{ width: 12, height: 12 }} />
              <span className="text-truncate">{certTypeName}</span>
            </div>
          )}
        </div>
      </div>

      <div className="border-top px-4 py-3 d-flex align-items-center justify-content-end gap-2">
        <Link to={`/courses/${course.id}`} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" title="Ver contenido">
          <FaEye style={{ width: 13, height: 13 }} /> Ver
        </Link>
        {canManage && (
          <button onClick={() => onEdit(course)} className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" title="Editar curso">
            <FaPencilAlt style={{ width: 13, height: 13 }} /> Editar
          </button>
        )}
      </div>
    </div>
  )
}

function courseStatusVariant(status: string) {
  return status === 'published' ? 'success' as const : 'warning' as const
}
