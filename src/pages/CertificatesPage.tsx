import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext'
import { useCertifiedUsers, useUsers } from '../hooks/useUsers'
import { useCertificates, useIssueCertificate } from '../hooks/useCertificates'
import { useCertificateTypes } from '../hooks/useCertificateTypes'
import { userService } from '../services/userService'
import Card from '../components/molecules/Card'
import SearchBar from '../components/molecules/SearchBar'
import SearchableSelect from '../components/molecules/SearchableSelect'
import Pagination from '../components/molecules/Pagination'
import Modal from '../components/molecules/Modal'
import RenewCertificateModal from '../components/organisms/RenewCertificateModal'
import EditCertificateStatusModal from '../components/organisms/EditCertificateStatusModal'
import Button from '../components/atoms/Button'
import Badge from '../components/atoms/Badge'
import Input from '../components/atoms/Input'
import Skeleton from '../components/atoms/Skeleton'
import { FaPlus, FaPencilAlt, FaFilePdf, FaQrcode, FaSyncAlt, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { getErrorMessage } from '../lib/error'
import { formatDate } from '../lib/dates'
import { certificateStatusVariant } from '../lib/statusVariant'
import { config } from '../config'
import type { Certificate } from '../types'

const PAGE_SIZE = 15

interface UserGroup {
  userId: number; userName: string; userEmail: string; userDoc: string; certificates: Certificate[]
}

export default function CertificatesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'superuser' || user?.role === 'admin'
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [adminPage, setAdminPage] = useState(1)
  const [plainPage, setPlainPage] = useState(1)
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set())
  const [issueModalOpen, setIssueModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | number>('')
  const [selectedTypeId, setSelectedTypeId] = useState<string | number>('')
  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)
  const [renewCert, setRenewCert] = useState<Certificate | null>(null)
  const [editCert, setEditCert] = useState<Certificate | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setAdminPage(1)
      setPlainPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  const adminSkip = (adminPage - 1) * PAGE_SIZE
  const plainSkip = (plainPage - 1) * PAGE_SIZE
  const s = debouncedSearch || undefined

  const { data: certifiedUsers, isLoading: loadingCertified } = useCertifiedUsers(
    { skip: adminSkip, limit: PAGE_SIZE, search: s },
    { enabled: isAdmin },
  )
  const { data: students } = useUsers({ role: 'student', limit: 500 }, { enabled: isAdmin })
  const { data: plainCerts, isLoading: loadingPlain } = useCertificates(
    { skip: plainSkip, limit: PAGE_SIZE, search: s },
    { enabled: !isAdmin },
  )
  const { data: certTypes } = useCertificateTypes({ limit: 2000 })
  const issueCert = useIssueCertificate()
  const isLoading = isAdmin ? loadingCertified : loadingPlain

  const typeMap = useMemo(() => {
    if (!certTypes) return {} as Record<number, string>
    return Object.fromEntries(certTypes.map((t) => [t.id, t.name]))
  }, [certTypes])

  const userGroups: UserGroup[] = useMemo(() => {
    if (!isAdmin || !certifiedUsers) return []
    return certifiedUsers.items.filter((cu) => cu.certificates && cu.certificates.length > 0).map((cu) => ({
      userId: cu.id, userName: cu.name || `Usuario #${cu.id}`, userEmail: cu.email, userDoc: cu.identity_number,
      certificates: [...cu.certificates].sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime()),
    })).sort((a, b) => a.userName.localeCompare(b.userName))
  }, [isAdmin, certifiedUsers])

  const adminTotalPages = Math.ceil((certifiedUsers?.total ?? 0) / PAGE_SIZE)
  const plainTotalPages = Math.ceil((plainCerts?.total ?? 0) / PAGE_SIZE)

  function toggleUser(userId: number) {
    setExpandedUsers((prev) => { const n = new Set(prev); if (n.has(userId)) n.delete(userId); else n.add(userId); return n })
  }

  function openEdit(c: Certificate) { setEditCert(c) }

  async function handleIssueSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!selectedUserId || !selectedTypeId) return
    try { await issueCert.mutateAsync({ user_id: Number(selectedUserId), certificate_type_id: Number(selectedTypeId), issued_at: issuedAt || undefined, validity_extension: validityExtension ?? undefined }); toast.success('Certificado emitido correctamente'); setIssueModalOpen(false); setSelectedUserId(''); setSelectedTypeId(''); setIssuedAt(''); setValidityExtension(null) }
    catch (err) { toast.error(getErrorMessage(err)) }
  }

  const flatRows = useMemo(() => !isAdmin && plainCerts ? plainCerts.items.map((c) => ({ cert: c })) : [], [isAdmin, plainCerts])

  const studentOptions = useMemo(() => (students?.items || []).map((s) => ({ value: s.id, label: `${s.name || ''} ${s.first_last_name || ''}`.trim() || s.email, sublabel: `${s.identity_type} ${s.identity_number} — ${s.email}` })), [students])
  const searchStudents = useCallback(async (query: string): Promise<{ value: number; label: string; sublabel: string }[]> => {
    const res = await userService.list({ role: 'student', limit: 50, search: query })
    return (res.items || []).map((s) => ({ value: s.id, label: `${s.name || ''} ${s.first_last_name || ''}`.trim() || s.email, sublabel: `${s.identity_type} ${s.identity_number} — ${s.email}` }))
  }, [])
  const certTypeOptions = useMemo(() => (certTypes || []).map((t) => ({
    value: t.id,
    label: t.name,
    sublabel: `${t.type} — ${t.hours} horas${t.reference ? ` · ${t.reference}` : ''}`,
  })), [certTypes])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-4 d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3">
        <div>
          <h1 className="fs-2 fw-bold text-neutral-800 mb-0">Certificados</h1>
          <p className="small text-muted mb-0">Emite y gestiona certificados</p>
        </div>
        {isAdmin && <Button onClick={() => setIssueModalOpen(true)}><FaPlus className="me-1" /> Adicionar Nuevo Certificado</Button>}
      </div>

      <Card padding={false}>
        <div className="border-bottom px-3 py-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar por estudiante, documento o UUID..." />
        </div>
        {isLoading ? (
          <div className="p-4"><Skeleton count={5} className="h-10 w-full" /></div>
        ) : isAdmin ? (
          <>
            <div className="divide-y">
              {userGroups.length === 0 ? (
                <p className="text-center py-5 small text-muted mb-0">No se encontraron certificados.</p>
              ) : userGroups.map((group) => {
                const expanded = expandedUsers.has(group.userId)
                return (
                  <div key={group.userId}>
                    <button onClick={() => toggleUser(group.userId)} className="w-100 d-flex align-items-center justify-content-between px-4 py-3 text-start border-0 bg-transparent hover-bg-light">
                      <div className="d-flex align-items-center gap-3 min-w-0">
                        {expanded ? <FaChevronDown className="text-muted flex-shrink-0" /> : <FaChevronRight className="text-muted flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="small fw-semibold text-neutral-800 mb-0 truncate">{group.userName}</p>
                          <small className="text-muted">{group.userEmail} · {group.userDoc}</small>
                        </div>
                      </div>
                      <Badge variant="default">{group.certificates.length} certificado{group.certificates.length !== 1 ? 's' : ''}</Badge>
                    </button>
                    {expanded && (
                      <div className="table-responsive border-top">
                        <table className="table table-sm table-striped mb-0">
                          <thead className="table-light">
                            <tr>
                              <th className="small text-muted text-center" style={{width:'50%'}}>Tipo</th>
                              <th className="small text-muted text-center" style={{width:'10%'}}>Estado</th>
                              <th className="small text-muted text-center" style={{width:'12%'}}>Emitido</th>
                              <th className="small text-muted text-center" style={{width:'12%'}}>Expira</th>
                              <th className="small text-muted text-center" style={{width:'auto'}}>UUID</th>
                              <th className="small text-muted text-center" style={{width:'auto'}}>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.certificates.map((cert) => (
                              <tr key={cert.id}>
                                <td className="text-start align-middle">{cert.certificate_type_id != null ? typeMap[cert.certificate_type_id] || `ID: ${cert.certificate_type_id}` : '—'}</td>
                                <td className="text-center align-middle"><Badge variant={certificateStatusVariant(cert.status)}>{cert.status}</Badge></td>
                                <td className="text-center align-middle small text-nowrap">{formatDate(cert.issued_at)}</td>
                                <td className="text-center align-middle small text-nowrap">{!cert.expires_at ? '—' : formatDate(cert.expires_at)}</td>
                                <td className="text-center align-middle"><small className="font-monospace text-muted cursor-pointer" title={cert.unique_id} onClick={() => navigator.clipboard.writeText(cert.unique_id)}>{cert.unique_id.slice(0, 8)}</small></td>
                                <td className="align-middle text-end text-nowrap">
                                  <div className="d-flex justify-content-end gap-1">
                                    <button onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}`, '_blank')} className="btn btn-sm btn-outline-secondary"><FaFilePdf /></button>
                                    <button onClick={() => window.open(`${config.apiUrl}/certificates/view/${cert.unique_id}/qr`, '_blank')} className="btn btn-sm btn-outline-secondary"><FaQrcode /></button>
                                    <button onClick={() => setRenewCert(cert)} disabled={cert.status === 'revoked'} className="btn btn-sm btn-outline-primary" title="Renovar"><FaSyncAlt /></button>
                                    <button onClick={() => openEdit(cert)} className="btn btn-sm btn-outline-secondary" title="Cambiar estado"><FaPencilAlt /></button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {adminTotalPages > 1 && (
              <Pagination page={adminPage} totalPages={adminTotalPages} onPageChange={setAdminPage} />
            )}
          </>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-sm table-striped mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="small text-muted text-center" style={{width:'50%'}}>Tipo</th>
                    <th className="small text-muted text-center" style={{width:'10%'}}>Estado</th>
                    <th className="small text-muted text-center" style={{width:'12%'}}>Emitido</th>
                    <th className="small text-muted text-center" style={{width:'12%'}}>Expira</th>
                    <th className="small text-muted text-center" style={{width:'auto'}}>UUID</th>
                    <th className="small text-muted text-center" style={{width:'auto'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {flatRows.map((r) => (
                    <tr key={r.cert.id}>
                      <td className="text-start align-middle">{r.cert.certificate_type_id != null ? typeMap[r.cert.certificate_type_id] || `ID: ${r.cert.certificate_type_id}` : '—'}</td>
                      <td className="text-center align-middle"><Badge variant={certificateStatusVariant(r.cert.status)}>{r.cert.status}</Badge></td>
                      <td className="text-center align-middle small text-nowrap">{formatDate(r.cert.issued_at)}</td>
                      <td className="text-center align-middle small text-nowrap">{!r.cert.expires_at ? '—' : formatDate(r.cert.expires_at)}</td>
                      <td className="text-center align-middle"><small className="font-monospace text-muted cursor-pointer" title={r.cert.unique_id} onClick={() => navigator.clipboard.writeText(r.cert.unique_id)}>{r.cert.unique_id.slice(0, 8)}</small></td>
                      <td className="align-middle text-end text-nowrap">
                        <div className="d-flex justify-content-end gap-1">
                          <button onClick={() => window.open(`${config.apiUrl}/certificates/view/${r.cert.unique_id}`, '_blank')} className="btn btn-sm btn-outline-secondary"><FaFilePdf /></button>
                          <button onClick={() => window.open(`${config.apiUrl}/certificates/view/${r.cert.unique_id}/qr`, '_blank')} className="btn btn-sm btn-outline-secondary"><FaQrcode /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {flatRows.length === 0 && <p className="text-center py-5 small text-muted mb-0">No se encontraron certificados.</p>}
            {plainTotalPages > 1 && (
              <Pagination page={plainPage} totalPages={plainTotalPages} onPageChange={setPlainPage} />
            )}
          </>
        )}
      </Card>

      <Modal open={issueModalOpen} onClose={() => setIssueModalOpen(false)} title="Adicionar Nuevo Certificado">
        <form onSubmit={handleIssueSubmit}>
          <SearchableSelect label="Usuario" options={studentOptions} value={selectedUserId} onChange={setSelectedUserId} placeholder="Buscar estudiante..." required onRemoteSearch={searchStudents} />
          <SearchableSelect label="Tipo de certificado" options={certTypeOptions} value={selectedTypeId} onChange={setSelectedTypeId} placeholder="Buscar tipo..." required />
          <Input label="Fecha de emisión (opcional)" type="date" value={issuedAt} onChange={(e) => setIssuedAt(e.target.value)} />
          <Input label="Extensión de vigencia (años, opcional)" type="number" min={1} value={validityExtension ?? ''} onChange={(e) => setValidityExtension(e.target.value ? Number(e.target.value) : null)} />
          <div className="d-flex justify-content-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setIssueModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={issueCert.isPending}>Emitir certificado</Button>
          </div>
        </form>
      </Modal>

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
    </div>
  )
}
