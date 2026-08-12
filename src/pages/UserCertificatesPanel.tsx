import { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useUser } from '../hooks/useUsers'
import { useCertificates } from '../hooks/useCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { useCourses } from '../hooks/useCourses'
import { useEnrollments, useCreateEnrollment, useDeleteEnrollment } from '../hooks/useEnrollments'
import Card from '../components/molecules/Card'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Skeleton from '../components/atoms/Skeleton'
import SearchBar from '../components/molecules/SearchBar'
import BatchCertificateModal from '../components/organisms/BatchCertificateModal'
import RenewCertificateModal from '../components/organisms/RenewCertificateModal'
import EditCertificateStatusModal from '../components/organisms/EditCertificateStatusModal'
import { FaArrowLeft, FaPlus, FaFilePdf, FaQrcode, FaFilter, FaPencilAlt, FaSyncAlt } from 'react-icons/fa'
import { getErrorMessage } from '../lib/error'
import { formatDate } from '../lib/dates'
import { certificateStatusVariant } from '../lib/statusVariant'
import { config } from '../config'
import type { Certificate, CertificateStatus } from '../types'

const STATUS_OPTIONS: { value: CertificateStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'revoked', label: 'Revocado' },
  { value: 'expired', label: 'Expirado' },
]

export default function UserCertificatesPanel() {
  const { userId } = useParams<{ userId: string }>()
  const uid = Number(userId)

  const { data: user, isLoading: loadingUser } = useUser(uid)
  const { data: certificates, isLoading: loadingCerts } = useCertificates(
    { user_id: uid, limit: 500 },
    { enabled: uid > 0 },
  )
  const { data: certTypes } = useCertificateTypes({ limit: 2000 })
  const { data: courses } = useCourses()
  const { data: enrollments } = useEnrollments(
    { user_id: uid },
    { enabled: uid > 0 },
  )
  const createEnrollment = useCreateEnrollment()
  const deleteEnrollment = useDeleteEnrollment()

  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilterOpen, setStatusFilterOpen] = useState(false)
  const [selectedStatuses, setSelectedStatuses] = useState<Set<CertificateStatus>>(new Set())
  const [renewCert, setRenewCert] = useState<Certificate | null>(null)
  const [editCert, setEditCert] = useState<Certificate | null>(null)
  const filterRef = useRef<HTMLDivElement>(null)

  function toggleStatus(status: CertificateStatus) {
    setSelectedStatuses((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  function clearStatuses() {
    setSelectedStatuses(new Set())
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setStatusFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const typeMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.name]))
  }, [certTypes])

  const typeInfoMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, { name: string; reference: string | null }>
    return Object.fromEntries(certTypes.map((t) => [t.id, { name: t.name, reference: t.reference }]))
  }, [certTypes])

  const courseByCertTypeId = useMemo(() => {
    if (!courses) return {} as Record<number, { id: number; title: string }>
    const map: Record<number, { id: number; title: string }> = {}
    for (const c of courses) {
      if (c.certificate_type_id != null) {
        map[c.certificate_type_id] = { id: c.id, title: c.title }
      }
    }
    return map
  }, [courses])

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments?.map((e) => e.course_id) ?? []),
    [enrollments],
  )

  function handleEnroll(courseId: number) {
    createEnrollment.mutateAsync({ user_id: uid, course_id: courseId })
      .then(() => toast.success('Usuario asignado al curso correctamente'))
      .catch((err) => toast.error(getErrorMessage(err)))
  }

  function handleUnenroll(enrollmentId: number) {
    deleteEnrollment.mutateAsync(enrollmentId)
      .then(() => toast.success('Usuario removido del curso correctamente'))
      .catch((err) => toast.error(getErrorMessage(err)))
  }

  const isLoading = loadingUser || loadingCerts

  const filteredCertificates = useMemo(() => {
    const list = certificates?.items
    if (!list) return []
    if (!searchQuery.trim() && selectedStatuses.size === 0) return list
    const q = searchQuery.toLowerCase()
    return list.filter((cert) => {
      if (selectedStatuses.size > 0 && !selectedStatuses.has(cert.status)) return false
      const info = cert.certificate_type_id != null ? typeInfoMap[cert.certificate_type_id] : undefined
      if (!info) return false
      return (
        info.name.toLowerCase().includes(q) ||
        (info.reference && info.reference.toLowerCase().includes(q))
      )
    })
  }, [certificates, searchQuery, selectedStatuses, typeInfoMap])

  return (
    <>
      <div className="sticky-top bg-white border-bottom z-1 px-6 lg:px-8 py-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <Link to="/users" className="small text-muted text-decoration-none mb-1 d-inline-block">
            <FaArrowLeft className="me-1" /> Volver a Usuarios
          </Link>
          {loadingUser ? (
            <Skeleton className="h-6 w-48" />
          ) : (
            <>
              <h1 className="fs-2 fw-bold text-neutral-800 mb-0">
                {user?.name || ''} {user?.first_last_name || ''}
              </h1>
              <p className="small text-muted mb-0">
                {user?.email} &middot; {user?.identity_type} {user?.identity_number}
              </p>
            </>
          )}
        </div>
        <Button onClick={() => setBatchModalOpen(true)} disabled={!uid}>
          <FaPlus className="me-1" /> Generar nuevo certificado
        </Button>
      </div>

      <div className="px-6 lg:px-8 pb-6 lg:pb-8">

      <Card padding={false}>
        {isLoading ? (
          <div className="p-4"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : (
          <>
          <div className="border-bottom px-3 py-3 d-flex gap-2 align-items-center flex-wrap">
            <div className="flex-grow-1" style={{ minWidth: 200 }}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Buscar por tipo o referencia..." />
            </div>
            <div ref={filterRef} className="position-relative">
              <button
                onClick={() => setStatusFilterOpen((o) => !o)}
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              >
                <FaFilter /> Estado
                {selectedStatuses.size > 0 && <Badge variant="info">{selectedStatuses.size}</Badge>}
              </button>
              {statusFilterOpen && (
                <div className="position-absolute end-0 mt-1 p-2 bg-white border rounded shadow z-3" style={{ minWidth: 160 }}>
                  {STATUS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="d-flex align-items-center gap-2 px-2 py-1 cursor-pointer small mb-0">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.has(opt.value)}
                        onChange={() => toggleStatus(opt.value)}
                        className="flex-shrink-0"
                      />
                      {opt.label}
                    </label>
                  ))}
                  <button
                    onClick={clearStatuses}
                    className="btn btn-sm btn-link p-0 mt-1 text-decoration-none"
                  >
                    Todos
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-sm table-striped mb-0">
              <thead className="table-light">
                  <tr>
                    <th className="small text-muted text-start" style={{width:'40%'}}>Tipo</th>
                    <th className="small text-muted text-center ps-4" style={{width:'10%'}}>Referencia</th>
                    <th className="small text-muted text-center" style={{width:'8%'}}>Estado</th>
                    <th className="small text-muted text-center" style={{width:'10%'}}>Emitido</th>
                    <th className="small text-muted text-center" style={{width:'10%'}}>Expira</th>
                    <th className="small text-muted text-center" style={{width:'15%'}}>Curso asociado</th>
                    <th className="small text-muted text-center" style={{width:'7%'}}>Acción curso</th>
                    <th className="small text-muted text-center" style={{width:'auto'}}>Acciones</th>
                  </tr>
              </thead>
              <tbody>
                {(!filteredCertificates || filteredCertificates.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 small text-muted">
                      {searchQuery || selectedStatuses.size > 0 ? 'No se encontraron certificados con ese filtro.' : 'Este usuario no tiene certificados.'}
                    </td>
                  </tr>
                ) : (
                  filteredCertificates.map((cert) => {
                    const courseInfo = cert.certificate_type_id != null
                      ? courseByCertTypeId[cert.certificate_type_id]
                      : undefined
                    const isEnrolled = courseInfo ? enrolledCourseIds.has(courseInfo.id) : false
                    const enrollmentId = courseInfo
                      ? enrollments?.find((e) => e.course_id === courseInfo.id)?.id
                      : undefined

                    return (
                      <tr key={cert.id}>
                        <td className="text-start align-middle">
                          {cert.certificate_type_id != null
                            ? typeMap[cert.certificate_type_id] || `ID: ${cert.certificate_type_id}`
                            : '\u2014'}
                        </td>
                        <td className="text-center align-middle small text-muted ps-4">
                          {cert.certificate_type_id != null
                            ? (typeInfoMap[cert.certificate_type_id]?.reference || '\u2014')
                            : '\u2014'}
                        </td>
                        <td className="text-center align-middle">
                          <Badge variant={certificateStatusVariant(cert.status)}>{cert.status}</Badge>
                        </td>
                        <td className="text-center align-middle small text-nowrap">
                          {formatDate(cert.issued_at)}
                        </td>
                        <td className="text-center align-middle small text-nowrap">
                          {!cert.expires_at ? '\u2014' : formatDate(cert.expires_at)}
                        </td>
                        <td className="text-center align-middle">
                          {courseInfo ? (
                            <span className="small fw-medium text-success">
                              {courseInfo.title}
                            </span>
                          ) : (
                            <span className="small text-muted">&mdash;</span>
                          )}
                        </td>
                        <td className="text-center align-middle">
                          {courseInfo ? (
                            isEnrolled ? (
                              <button
                                onClick={() => enrollmentId && handleUnenroll(enrollmentId)}
                                className="btn btn-sm btn-outline-danger"
                                disabled={deleteEnrollment.isPending}
                              >
                                Remover
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(courseInfo.id)}
                                className="btn btn-sm btn-outline-success"
                                disabled={createEnrollment.isPending}
                              >
                                Asignar
                              </button>
                            )
                          ) : (
                            <span className="small text-muted">N/A</span>
                          )}
                        </td>
                        <td className="align-middle text-end text-nowrap">
                          <div className="d-flex justify-content-end gap-1">
                            <button
                              onClick={() => setEditCert(cert)}
                              className="btn btn-sm btn-outline-secondary"
                              title="Cambiar estado"
                            >
                              <FaPencilAlt />
                            </button>
                            <button
                              onClick={() => setRenewCert(cert)}
                              disabled={cert.status === 'revoked'}
                              className="btn btn-sm btn-outline-primary"
                              title="Renovar"
                            >
                              <FaSyncAlt />
                            </button>
                            <button
                              onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}`, '_blank')}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <FaFilePdf />
                            </button>
                            <button
                              onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}/qr`, '_blank')}
                              className="btn btn-sm btn-outline-secondary"
                            >
                              <FaQrcode />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>
      </div>

      {uid > 0 && (
        <BatchCertificateModal
          open={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          userId={uid}
          userName={`${user?.name || ''} ${user?.first_last_name || ''}`.trim() || user?.email || ''}
          certTypes={certTypes || []}
        />
      )}

      {renewCert && (
        <RenewCertificateModal
          open
          onClose={() => setRenewCert(null)}
          certificate={renewCert}
        />
      )}

      {editCert && (
        <EditCertificateStatusModal
          open
          onClose={() => setEditCert(null)}
          certificate={editCert}
        />
      )}
    </>
  )
}
