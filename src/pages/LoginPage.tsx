import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Button, Form, Alert } from 'react-bootstrap'
import { getErrorMessage } from '../lib/error'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen d-flex align-items-center justify-center"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="position-fixed inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} />

      <div
        className="position-relative rounded-4 shadow-lg p-5"
        style={{
          maxWidth: 420,
          width: '100%',
          backgroundColor: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="text-center mb-4">
          <div className="d-flex justify-content-center">
            <Link to="/">
              <img src="/logo.png" alt="InnovaSalud" className="mw-100" style={{ height: 200 }} />
            </Link>
          </div>
          <p className="text-muted mt-2 mb-0">Inicia sesión</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small fw-medium">Correo electrónico</Form.Label>
            <Form.Control
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-secondary small fw-medium">Contraseña</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              size="lg"
            />
          </Form.Group>

          {error && (
            <Alert variant="danger" className="py-2 small">{error}</Alert>
          )}

          <Button type="submit" variant="primary" size="lg" className="w-100 mt-2" disabled={loading}>
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </Button>
        </Form>

        <Link to="/" className="d-inline-block mt-3 small text-bar-600 text-decoration-none hover:text-bar-700">&larr; Volver al inicio</Link>
      </div>
    </div>
  )
}
