import { Link } from 'react-router-dom'
import { config } from '../../config'

export default function PublicFooter() {
  return (
    <footer className="bg-bar-900 py-12 border-t border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-10 max-w-7xl mx-auto gap-4">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <img src="/logovector.svg" alt="InnovaSalud" className="h-10 w-auto brightness-0 invert" />
            <span className="text-2xl font-black text-white">InnovaSalud</span>
          </div>
          <p className="text-base text-white/70 text-center md:text-left">&copy; {new Date().getFullYear()} InnovaSalud. Transformando la educación en salud.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link to="/privacy" className="text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:underline transition-all">Privacidad</Link>
          <Link to="/terms" className="text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:underline transition-all">Términos de Servicio</Link>
          <Link to="/faq" className="text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:underline transition-all">Ayuda</Link>
          <a href="#contact" className="text-xs font-semibold tracking-wider text-white/70 hover:text-white hover:underline transition-all">Contacto</a>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'InnovaSalud', url: window.location.href })
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-bar-200 transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-white group-hover:text-bar-900">share</span>
          </button>
          <a
            href={`https://wa.me/${config.contactPhone.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-bar-500 transition-colors cursor-pointer group"
          >
            <span className="material-symbols-outlined text-white group-hover:text-bar-900">call</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
