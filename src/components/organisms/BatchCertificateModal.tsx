import { useState, useMemo, useRef, useEffect } from 'react'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import { useBatchIssueCertificates } from '../../hooks/useCertificates'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/error'
import type { CertificateType } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  userId: number
  userName: string
  certTypes: CertificateType[]
}

export default function BatchCertificateModal({ open, onClose, userId, userName, certTypes }: Props) {
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const batchIssue = useBatchIssueCertificates()
  const searchRef = useRef<HTMLInputElement>(null)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setSearch('')
      setSelectedIds(new Set())
      setIssuedAt('')
      setValidityExtension(null)
      setShowResults(false)
    }
  }

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => searchRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return certTypes
    return certTypes.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.type.toLowerCase().includes(q) ||
        String(t.hours).includes(q) ||
        (t.reference && t.reference.toLowerCase().includes(q)),
    )
  }, [certTypes, search])

  function toggle(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedIds.size === 0) {
      toast.error('Selecciona al menos un tipo de certificado')
      return
    }
    try {
      const result = await batchIssue.mutateAsync({
        user_id: userId,
        certificate_type_ids: Array.from(selectedIds),
        issued_at: issuedAt || undefined,
        validity_extension: selectedIds.size === 1 ? (validityExtension ?? undefined) : undefined,
      })
      setShowResults(true)
      const issuedCount = result.issued.length
      const errorCount = result.errors.length
      if (errorCount === 0) {
        toast.success(`${issuedCount} certificado${issuedCount !== 1 ? 's' : ''} emitido${issuedCount !== 1 ? 's' : ''} correctamente`)
      } else if (issuedCount > 0) {
        toast.warning(`${issuedCount} emitido${issuedCount !== 1 ? 's' : ''}, ${errorCount} error${errorCount !== 1 ? 'es' : ''}`)
      } else {
        toast.error(`Error al emitir: ${result.errors[0]?.error || 'desconocido'}`)
      }
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Generar certificados por lote">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="small fw-medium text-secondary">Usuario</label>
          <p className="form-control-plaintext py-1 mb-0">{userName}</p>
        </div>

        <div className="mb-3">
          <label className="small fw-medium text-secondary mb-1">
            Tipos de certificado {selectedIds.size > 0 && <span className="text-muted">({selectedIds.size} seleccionado{selectedIds.size !== 1 ? 's' : ''})</span>}
          </label>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tipo, horas o referencia..."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm mb-2"
          />
          <div className="border rounded-lg max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center py-3 small text-muted mb-0">Sin resultados</p>
            ) : (
              <>
                <label className="d-flex align-items-center px-3 py-2 border-bottom bg-neutral-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onChange={selectAll}
                    className="me-2"
                  />
                  <span className="small fw-medium text-muted">
                    {selectedIds.size === filtered.length && filtered.length > 0
                      ? 'Deseleccionar todos'
                      : 'Seleccionar todos'}
                  </span>
                </label>
                {filtered.map((t) => (
                  <label
                    key={t.id}
                    className="d-flex align-items-center px-3 py-2 border-bottom hover-bg-light cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t.id)}
                      onChange={() => toggle(t.id)}
                      className="me-2 flex-shrink-0"
                    />
                    <div>
                      <p className="small fw-medium mb-0">{t.name}</p>
                      <small className="text-muted">
                        {t.type} &middot; {t.hours} horas{t.reference ? ` · ${t.reference}` : ''}
                      </small>
                    </div>
                  </label>
                ))}
              </>
            )}
          </div>
        </div>

        <Input
          label="Fecha de emisión (opcional)"
          type="date"
          value={issuedAt}
          onChange={(e) => setIssuedAt(e.target.value)}
        />

        <Input
          label="Extensión de vigencia (años, opcional)"
          type="number"
          min={1}
          value={validityExtension ?? ''}
          onChange={(e) => setValidityExtension(e.target.value ? Number(e.target.value) : null)}
          disabled={selectedIds.size !== 1}
        />
        {selectedIds.size !== 1 && (
          <small className="text-muted d-block mb-3">
            Solo disponible al seleccionar un único tipo de certificado.
          </small>
        )}

        {showResults && batchIssue.data && (
          <div className="mt-3 p-3 rounded-lg border">
            <p className="small fw-medium mb-1">
              {batchIssue.data.issued.length} emitido{batchIssue.data.issued.length !== 1 ? 's' : ''}
              {batchIssue.data.errors.length > 0 && (
                <span className="text-danger ms-2">
                  {batchIssue.data.errors.length} error{batchIssue.data.errors.length !== 1 ? 'es' : ''}
                </span>
              )}
            </p>
            {batchIssue.data.errors.length > 0 && (
              <ul className="small text-danger mb-0 ps-3">
                {batchIssue.data.errors.map((err, i) => (
                  <li key={i}>Tipo #{err.certificate_type_id}: {err.error}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="d-flex justify-content-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cerrar</Button>
          <Button type="submit" loading={batchIssue.isPending} disabled={selectedIds.size === 0}>
            Emitir certificados
          </Button>
        </div>
      </form>
    </Modal>
  )
}
