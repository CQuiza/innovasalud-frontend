import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-content-50">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/30 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <Link to="/" className="text-2xl font-bold text-bar-900">InnovaSalud</Link>
          <Link to="/" className="text-sm font-medium tracking-wide text-bar-500 hover:text-bar-700 transition-colors">Volver al inicio</Link>
        </nav>
      </header>
      <main className="max-w-3xl mx-auto px-4 md:px-10 py-20">
        <h1 className="text-3xl font-semibold text-bar-900 tracking-tight mb-8">Términos de Servicio</h1>
        <div className="space-y-6 text-neutral-600 leading-relaxed">
          <p>Al acceder y utilizar la plataforma InnovaSalud, aceptas cumplir con estos términos de servicio. Si no estás de acuerdo, no utilices nuestros servicios.</p>
          <h2 className="text-xl font-semibold text-bar-900">Uso de la Plataforma</h2>
          <p>La plataforma está diseñada para la formación virtual en el sector salud. Los usuarios deben proporcionar información veraz y mantener la confidencialidad de sus credenciales.</p>
          <h2 className="text-xl font-semibold text-bar-900">Certificaciones</h2>
          <p>Los certificados emitidos corresponden a educación informal según la normativa colombiana. No constituyen títulos profesionales ni certificaciones de aptitud ocupacional.</p>
          <h2 className="text-xl font-semibold text-bar-900">Propiedad Intelectual</h2>
          <p>Todo el contenido educativo disponible en la plataforma está protegido por derechos de autor. No está permitida su reproducción o distribución sin autorización.</p>
          <h2 className="text-xl font-semibold text-bar-900">Limitación de Responsabilidad</h2>
          <p>InnovaSalud no se hace responsable por el mal uso de la información o certificados obtenidos a través de la plataforma.</p>
        </div>
      </main>
    </div>
  )
}
