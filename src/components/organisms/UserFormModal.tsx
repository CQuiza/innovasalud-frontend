import { useState } from 'react'
import Modal from '../molecules/Modal'
import Button from '../atoms/Button'
import Input from '../atoms/Input'
import type { User } from '../../types'
import { IdentityType } from '../../types'

interface FormData {
  email: string; password: string; name: string; first_last_name: string; second_last_name: string
  role: string; identity_type: string; identity_number: string; phone_number: string; is_active: boolean
}

const emptyForm: FormData = {
  email: '', password: '', name: '', first_last_name: '', second_last_name: '',
  role: 'student', identity_type: 'CC', identity_number: '', phone_number: '', is_active: true,
}

interface UserFormModalProps {
  isOpen: boolean; onClose: () => void; user?: User | null
  roleOptions: { value: string; label: string }[]; isSaving?: boolean
  onSubmit: (data: Record<string, unknown>, mode: 'create' | 'edit') => Promise<void>
}

export default function UserFormModal({ isOpen, onClose, user, roleOptions, isSaving, onSubmit }: UserFormModalProps) {
  const [form, setForm] = useState<FormData>(emptyForm)

  const [prevOpen, setPrevOpen] = useState(isOpen)
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen)
    if (isOpen) {
      if (user) {
        setForm({ email: user.email, password: '', name: user.name || '', first_last_name: user.first_last_name || '', second_last_name: user.second_last_name || '', role: user.role, identity_type: user.identity_type, identity_number: user.identity_number, phone_number: user.phone_number, is_active: user.is_active })
      } else {
        setForm(emptyForm)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const mode = user ? 'edit' : 'create'
    const payload: Record<string, unknown> = { email: form.email, name: form.name || null, first_last_name: form.first_last_name || null, second_last_name: form.second_last_name || null, role: form.role, identity_type: form.identity_type, identity_number: form.identity_number, phone_number: form.phone_number || undefined, is_active: form.is_active }
    if (mode === 'edit' ? form.password : true) payload.password = form.password
    await onSubmit(payload, mode)
  }

  return (
    <Modal open={isOpen} onClose={onClose} title={user ? 'Editar usuario' : 'Nuevo usuario'}>
      <form onSubmit={handleSubmit} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Input label={user ? 'Contraseña (dejar vacío para mantener)' : 'Contraseña'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!user} />
        <div className="row g-3">
          <div className="col-6"><Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="col-6"><Input label="Primer apellido" value={form.first_last_name} onChange={(e) => setForm({ ...form, first_last_name: e.target.value })} /></div>
        </div>
        <Input label="Segundo apellido" value={form.second_last_name} onChange={(e) => setForm({ ...form, second_last_name: e.target.value })} />
        <div className="row g-3">
          <div className="col-6">
            <label className="form-label small fw-medium text-secondary">Rol</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-select" required>
              {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label small fw-medium text-secondary">Tipo ID</label>
            <select value={form.identity_type} onChange={(e) => setForm({ ...form, identity_type: e.target.value })} className="form-select" required>
              {Object.values(IdentityType).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-6"><Input label="Número ID" value={form.identity_number} onChange={(e) => setForm({ ...form, identity_number: e.target.value })} required /></div>
          <div className="col-6"><Input label="Teléfono (opcional)" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} /></div>
        </div>
        <div className="form-check mb-3">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="form-check-input" id="isActive" />
          <label className="form-check-label small" htmlFor="isActive">Usuario activo</label>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isSaving}>{user ? 'Guardar cambios' : 'Crear usuario'}</Button>
        </div>
      </form>
    </Modal>
  )
}
