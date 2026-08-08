import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-content-50">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/30 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold text-bar-900">InnovaSalud</Link>
          <Link to="/" className="text-sm font-medium tracking-wide text-bar-500 hover:text-bar-700 transition-colors">Volver al inicio</Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 md:px-10 py-20">
        <h1 className="text-3xl font-semibold text-bar-900 tracking-tight mb-8">Política de Privacidad</h1>
        <div className="space-y-6 text-neutral-600 leading-relaxed">
          <p>En InnovaSalud, nos comprometemos a proteger tu privacidad. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.</p>
          <h2 className="text-xl font-semibold text-bar-900">Información que Recopilamos</h2>
          <p>Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico, número de teléfono y datos académicos necesarios para la emisión de certificados.</p>
          <h2 className="text-xl font-semibold text-bar-900">Uso de la Información</h2>
          <p>Utilizamos tu información para gestionar tu cuenta, procesar inscripciones, emitir certificados y mejorar nuestros servicios educativos.</p>
          <h2 className="text-xl font-semibold text-bar-900">Protección de Datos</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o alteración.</p>
          <h2 className="text-xl font-semibold text-bar-900">Tus Derechos</h2>
          <p>Tienes derecho a acceder, rectificar o eliminar tus datos personales en cualquier momento. Para ejercer estos derechos, contáctanos a través de nuestros canales de atención.</p>
        </div>
      </main>
    </div>
  )
}
