import { useState } from 'react'
import { Form } from 'react-bootstrap'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Badge from '../atoms/Badge'
import { useUpdateCertificate } from '../../hooks/useCertificates'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/error'
import { formatDate } from '../../lib/dates'
import { certificateStatusVariant } from '../../lib/statusVariant'
import type { Certificate, CertificateStatus } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  certificate: Certificate
}

export default function EditCertificateStatusModal({ open, onClose, certificate }: Props) {
  const [editStatus, setEditStatus] = useState<CertificateStatus>(certificate.status)
  const update = useUpdateCertificate(certificate.id)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setEditStatus(certificate.status)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await update.mutateAsync({ status: editStatus })
      toast.success('Certificado actualizado correctamente')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Actualizar certificado">
      <form onSubmit={handleSubmit}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <Badge variant={certificateStatusVariant(certificate.status)}>{certificate.status}</Badge>
          <small className="font-monospace text-muted">{certificate.unique_id}</small>
        </div>
        <p className="small text-muted mb-3">
          Emitido {formatDate(certificate.issued_at)}
          {certificate.expires_at ? ` · Expira ${formatDate(certificate.expires_at)}` : ''}
        </p>
        <Form.Group className="mb-3">
          <Form.Label className="small fw-medium text-secondary">Estado</Form.Label>
          <Form.Select
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value as CertificateStatus)}
            required
          >
            <option value="active">Activo</option>
            <option value="revoked">Revocado</option>
          </Form.Select>
        </Form.Group>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={update.isPending} disabled={update.isPending}>Guardar</Button>
        </div>
      </form>
    </Modal>
  )
}
