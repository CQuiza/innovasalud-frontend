import { useState } from 'react'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import { useRenewCertificate } from '../../hooks/useCertificates'
import { toast } from 'sonner'
import { getErrorMessage } from '../../lib/error'
import type { Certificate } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  certificate: Certificate
}

export default function RenewCertificateModal({ open, onClose, certificate }: Props) {
  const [issuedAt, setIssuedAt] = useState('')
  const [validityExtension, setValidityExtension] = useState<number | null>(null)
  const [hours, setHours] = useState<number | null>(null)
  const renew = useRenewCertificate(certificate.id)

  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setIssuedAt('')
      setValidityExtension(null)
      setHours(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await renew.mutateAsync({
        issued_at: issuedAt || undefined,
        validity_extension: validityExtension ?? undefined,
        hours: hours ?? undefined,
      })
      toast.success('Certificado renovado correctamente')
      onClose()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Renovar certificado">
      <form onSubmit={handleSubmit}>
        <p className="small text-muted mb-3">
          El certificado actual será revocado y se emitirá uno nuevo con los mismos datos.
        </p>
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
        />
        <Input
          label="Número de horas (opcional)"
          type="number"
          min={1}
          value={hours ?? ''}
          onChange={(e) => setHours(e.target.value ? Number(e.target.value) : null)}
        />
        <div className="d-flex justify-content-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={renew.isPending} disabled={renew.isPending}>Renovar</Button>
        </div>
      </form>
    </Modal>
  )
}
