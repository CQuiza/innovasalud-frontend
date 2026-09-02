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
        <div className="space-y-6 text-neutral-600 leading-relaxed">
          <div className="bg-bar-500/5 border-l-4 border-bar-500 rounded-2xl p-8 space-y-5">
            <h2 className="text-xl font-semibold text-bar-900 flex items-center gap-2">
              <span className="material-symbols-outlined">gavel</span> Legalidad
            </h2>
            <p>
              El día 18 de abril de 2023 se creó <strong className="font-bold text-bar-900">INNOVASALUD COLOMBIA S.A.S.</strong> con el número de matrícula{' '}
              <span className="inline-block bg-bar-900 text-white font-bold text-base px-3 py-1 rounded-lg">406790</span>{' '}
              en la Cámara de Comercio de Neiva como establecimiento de comercio siendo una sociedad comercial con las actividades 8551: Formación para el trabajo y 7020: Actividades de consultoría de gestión.
            </p>
            <a
              href="https://www.rues.org.co/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-bar-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-bar-700 transition-colors"
            >
              Confirmar esta infromación
              <span className="material-symbols-outlined">open_in_new</span>
            </a>
          </div>
          <h1 className="text-3xl font-semibold text-bar-900 tracking-tight mb-8">Términos de Servicio</h1>
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
