import { useState } from 'react'
import { Link } from 'react-router-dom'
import { config } from '../config'


const faqs = [
  { q: '¿Los certificados tienen validez?', a: 'Sí. Nuestros certificados acreditan la participación y aprobación del curso realizado. Cada certificado puede verificarse mediante un código QR, garantizando su autenticidad y facilitando su validación.' },
  { q: '¿Cómo recibo mi certificado?', a: 'Una vez confirmemos tu inscripción y registremos correctamente tus datos en nuestro sistema, recibirás tu certificado de manera inmediata en formato digital, listo para descargar y compartir cuando lo necesites.' },
  { q: '¿Los cursos son completamente virtuales?', a: 'Sí. Todos nuestros cursos y diplomados se desarrollan en modalidad 100 % virtual, permitiéndote estudiar desde cualquier lugar y avanzar según tu disponibilidad.' },
  { q: '¿Debo cumplir un horario?', a: 'No. Puedes acceder a la plataforma las 24 horas del día, los 7 días de la semana, y estudiar a tu propio ritmo.' },
]

export default function HomePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formName, setFormName] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formProgram, setFormProgram] = useState('Seleccione una opción')
  const [formMessage, setFormMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const subject = encodeURIComponent(`Contacto desde la web — ${formName}`)
    const body = encodeURIComponent(
      `Nombre: ${formName}\nEmail: ${formEmail}\nPrograma: ${formProgram}\n\nMensaje:\n${formMessage}`
    )
    window.location.href = `mailto:${config.contactEmail}?subject=${subject}&body=${body}`
    setSent(true)
    setFormName('')
    setFormEmail('')
    setFormProgram('Seleccione una opción')
    setFormMessage('')
  }

  return (
    <div className="min-h-screen bg-content-50">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/30 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="InnovaSalud" className="h-27 w-auto" />
            {/* <span className="text-2xl font-bold text-bar-900">InnovaSalud</span> */}
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/search" className="text-sm font-medium tracking-wide text-neutral-600 hover:text-bar-900 transition-colors">Verificar certificado</Link>
            <Link to="/catalog" className="text-sm font-medium tracking-wide text-neutral-600 hover:text-bar-900 transition-colors">Catálogo</Link>
            <Link to="/login" className="bg-bar-900 text-white px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:opacity-90 transition-all scale-95 active:scale-90">
              Iniciar sesión
            </Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-bar-900">
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </nav>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200/30 bg-white px-4 py-6 space-y-4">
            <Link to="/search" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-neutral-600 hover:text-bar-900">Verificar certificado</Link>
            <Link to="/catalog" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-neutral-600 hover:text-bar-900">Catálogo</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-bar-900 text-white px-6 py-2.5 rounded-full text-sm font-medium">Iniciar sesión</Link>
          </div>
        )}
      </header>

      <main>
        <section className="bg-gradient-to-br from-bar-900 to-bar-700 relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 md:px-10 grid lg:grid-cols-2 gap-12 items-center relative z-10">
            <div className="text-left space-y-6">
              <span className="inline-block px-4 py-1.5 rounded-full bg-bar-200/20 text-bar-200 text-xs font-semibold tracking-wider uppercase">Líder en Educación Médica</span>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight md:leading-tight tracking-tight">Formación Virtual para el Sector Salud</h1>
              <p className="text-lg text-white/80 max-w-xl leading-relaxed text-justify">
                Especialízate con los mejores programas de capacitación continua. Calidad académica, flexibilidad total y certificación inmediata.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/catalog" className="bg-bar-200 text-bar-900 px-8 py-4 rounded-xl text-xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Ver cursos
                </Link>
                <a href={`https://wa.me/${config.contactPhone.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer" className="border border-white/30 text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-white/10 transition-all">
                  Contáctanos
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <img
                  src="/hero-medical.jpg"
                  alt="Profesional de la salud interactuando con herramientas de aprendizaje digital en un entorno clínico moderno"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-md border border-white/30 p-6 rounded-2xl shadow-xl hidden md:block">
                <div className="flex items-center gap-4">
                  <div className="bg-bar-500/20 p-3 rounded-full">
                    <span className="material-symbols-outlined text-bar-500">verified_user</span>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-bar-900">+15,000</p>
                    <p className="text-xs font-semibold tracking-wide text-neutral-600">Estudiantes Certificados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-8">
                <h2 className="text-3xl font-semibold text-bar-900 tracking-tight">Capacítate con cursos virtuales certificados para el sector salud</h2>
                <p className="text-base text-neutral-600 leading-relaxed text-justify">
                  Brindamos formación virtual de calidad para el talento humano en salud, con programas diseñados para fortalecer conocimientos, desarrollar competencias y contribuir al crecimiento profesional de nuestros estudiantes.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-3xl text-bar-200">qr_code_scanner</span>
                    <div>
                      <h4 className="text-xl font-semibold text-bar-900">Verificación QR</h4>
                      <p className="text-sm font-medium tracking-wide text-neutral-600">Certificados auténticos y verificables al instante.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-3xl text-bar-500">language</span>
                    <div>
                      <h4 className="text-xl font-semibold text-bar-900">100% Virtual</h4>
                      <p className="text-sm font-medium tracking-wide text-neutral-600">Aprende a tu propio ritmo desde cualquier lugar.</p>
                    </div>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${config.contactPhone.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-bar-800 text-white px-8 py-4 rounded-2xl hover:bg-bar-900 transition-all"
                >
                  <span className="material-symbols-outlined">chat</span>
                  Asesoría por WhatsApp
                </a>
              </div>
              <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-12">
                  <div className="rounded-2xl overflow-hidden shadow-md">
                    <div className="aspect-[3/4] bg-cover bg-center" style={{ backgroundImage: 'url(/about-medical-1.jpg)' }} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-md">
                    <div className="aspect-[3/4] bg-cover bg-center" style={{ backgroundImage: 'url(/about-medical-2.jpg)' }} />
                  </div>
                  <div className="bg-bar-200 p-8 rounded-2xl text-bar-900">
                    <span className="material-symbols-outlined text-4xl mb-4">school</span>
                    <p className="text-2xl font-bold">Calidad Normativa</p>
                    <p className="text-sm font-medium tracking-wide">Cumplimos con todos los estándares educativos vigentes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-content-50">
          <div className="max-w-7xl mx-auto px-4 md:px-10 text-center mb-16">
            <h2 className="text-3xl font-semibold text-bar-900 tracking-tight">Explora Nuestro Catálogo</h2>
            <p className="text-base text-neutral-600 max-w-2xl mx-auto mt-4">Programas diseñados por expertos para potenciar tu perfil profesional en el área de la salud.</p>
          </div>
          <div className="max-w-7xl mx-auto px-4 md:px-10 grid md:grid-cols-3 gap-8">
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/20 hover:shadow-md hover:border-bar-500/40 transition-all">
              <div className="w-16 h-16 bg-bar-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bar-500 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-3xl">medical_services</span>
              </div>
              <h3 className="text-2xl font-semibold text-bar-900 mb-4">Cursos Básicos</h3>
              <p className="text-base text-neutral-600 mb-6 text-justify">Fundamentos esenciales para el personal de apoyo y estudiantes en formación inicial.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-200">check_circle</span> Primeros Auxilios</li>
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-200">check_circle</span> Soporte vital básico</li>
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-200">check_circle</span> Gestión del duelo</li>
              </ul>
              <Link to="/catalog" className="text-bar-500 text-sm font-medium tracking-wide flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Ver más programas <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="group bg-white p-8 rounded-3xl shadow-sm border border-neutral-200/20 hover:shadow-md hover:border-bar-200/40 transition-all">
              <div className="w-16 h-16 bg-bar-200/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-bar-200 group-hover:text-bar-900 transition-colors">
                <span className="material-symbols-outlined text-3xl">clinical_notes</span>
              </div>
              <h3 className="text-2xl font-semibold text-bar-900 mb-4">Avanzados</h3>
              <p className="text-base text-neutral-600 mb-6 text-justify">Capacitación técnica de alto nivel para profesionales en ejercicio y especialistas.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-500">check_circle</span> Soporte cardiovascular avanzado</li>
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-500">check_circle</span> Central de esterilización</li>
                <li className="flex items-center gap-2 text-sm font-medium"><span className="material-symbols-outlined text-lg text-bar-500">check_circle</span> Primeros Auxilios Psicologicos</li>
              </ul>
              <Link to="/catalog" className="text-bar-200 text-sm font-medium tracking-wide flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Ver más programas <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
            <div className="group bg-bar-900 p-8 rounded-3xl shadow-lg transition-all">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white group-hover:text-bar-900 transition-colors">
                <span className="material-symbols-outlined text-3xl text-white group-hover:text-bar-900">workspace_premium</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">Diplomados</h3>
              <p className="text-base text-white/70 mb-6 text-justify">Programas extensivos con alta carga horaria y enfoque en competencias específicas.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-medium text-white/90"><span className="material-symbols-outlined text-lg text-bar-200">stars</span> Gerontologia y geriatria</li>
                <li className="flex items-center gap-2 text-sm font-medium text-white/90"><span className="material-symbols-outlined text-lg text-bar-200">stars</span> Unidad Oncologica</li>
                <li className="flex items-center gap-2 text-sm font-medium text-white/90"><span className="material-symbols-outlined text-lg text-bar-200">stars</span> Clinica de heridas</li>
              </ul>
              <Link to="/catalog" className="text-white text-sm font-medium tracking-wide flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Explorar diplomados <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-bar-500">
                  <h3 className="text-2xl font-semibold text-bar-900 mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined">rocket_launch</span> Nuestra Misión
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed text-justify">
                    Brindar formación virtual de excelencia para el talento humano en salud, mediante programas académicos innovadores, flexibles y actualizados que impulsen el desarrollo profesional, el fortalecimiento de competencias y la mejora continua de la atención en salud.
                  </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-bar-200 translate-x-4 md:translate-x-8">
                  <h3 className="text-2xl font-semibold text-bar-900 mb-4 flex items-center gap-3">
                    <span className="material-symbols-outlined">visibility</span> Nuestra Visión
                  </h3>
                  <p className="text-base text-neutral-600 leading-relaxed text-justify">
                    Consolidarnos como el referente nacional en educación virtual para el sector salud, ofreciendo experiencias de aprendizaje innovadoras, tecnología de vanguardia y contenidos de alta calidad que contribuyan al crecimiento profesional y al fortalecimiento del sistema de salud colombiano.
                  </p>
                </div>
              </div>
              <div className="relative w-full flex items-center justify-center">
                <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    // src="https://www.youtube.com/embed/F5UrGfv3nog?rel=0&showinfo=0"
                    title="Video promocional"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bar-900 py-20 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold tracking-tight">¿Por qué elegir InnovaSalud?</h2>
              <p className="text-base text-white/60 mt-4">Formación virtual diseñada para impulsar tu crecimiento profesional con calidad, flexibilidad y confianza.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                { icon: 'verified', title: 'Certificación inmediata', desc: 'Obtén y descarga tu certificado de forma inmediata.' },
                { icon: 'qr_code', title: 'Verificación QR', desc: 'Verifica la autenticidad de tu certificado de manera rápida y segura mediante código QR.' },
                { icon: 'gavel', title: 'Cumplimiento Normativo', desc: 'Programas desarrollados conforme a la normativa vigente y orientados al fortalecimiento de las competencias del talento humano en salud.' },
                { icon: 'schedule', title: 'Acceso 24/7', desc: 'Accede a la plataforma en cualquier momento, desde cualquier dispositivo.' },
                { icon: 'devices', title: '100% Virtual', desc: 'Estudia desde cualquier lugar y avanza a tu propio ritmo, sin horarios fijos.' },
              ].map((item) => (
                <div key={item.title} className="text-center group">
                  <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-bar-200 transition-all duration-300">
                    <span className="material-symbols-outlined text-4xl group-hover:text-bar-900">{item.icon}</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm font-medium tracking-wide text-white/50">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>



        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 md:px-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold text-bar-900 tracking-tight">Preguntas Frecuentes</h2>
              <p className="text-base text-neutral-600 mt-4">Todo lo que necesitas saber para comenzar tu formación hoy mismo.</p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => {
                const open = openIndex === i
                return (
                  <div key={i} className={`border border-neutral-200/30 rounded-2xl overflow-hidden transition-all duration-300 ${open ? 'bg-blue-50 border-bar-500/30' : ''}`}>
                    <button
                      onClick={() => setOpenIndex(open ? null : i)}
                      className="w-full flex justify-between items-center p-6 text-left hover:bg-content-50 transition-colors group"
                    >
                      <span className="text-xl font-semibold text-bar-900">{faq.q}</span>
                      <span className={`material-symbols-outlined transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-500 ${open ? 'max-h-[500px]' : 'max-h-0'}`}>
                        <div className="p-6 text-base text-neutral-600 leading-relaxed text-justify">
                          {faq.a}
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="text-center mt-8">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 text-bar-500 hover:text-bar-700 transition-colors text-sm font-medium tracking-wide"
              >
                <span className="material-symbols-outlined text-xl">help</span>
                Ver más
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 bg-content-100 relative overflow-hidden">
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-bar-500/20 rounded-full blur-3xl" />
          <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl font-semibold text-bar-900 tracking-tight">Hablemos de tu futuro profesional</h2>
                <p className="text-base text-neutral-600 mt-6 mb-10 text-justify">Nuestro equipo está listo para asesorarte sobre el mejor camino formativo según tu perfil y metas.</p>
                <div className="space-y-6">
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-bar-500">mail</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-neutral-600 uppercase">Correo Electrónico</p>
                      <p className="text-xl font-semibold text-bar-900">{config.contactEmail}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${config.contactPhone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 group no-underline"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-bar-200">call</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-neutral-600 uppercase">WhatsApp / Teléfono</p>
                      <p className="text-xl font-semibold text-bar-900">{config.contactPhone}</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-6 group">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-bar-500">location_on</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold tracking-wider text-neutral-600 uppercase">Sede Principal</p>
                      <p className="text-xl font-semibold text-bar-900">{config.cityCountry}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-10 rounded-3xl shadow-xl">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {sent && (
                    <div className="bg-bar-200/20 text-bar-900 px-4 py-3 rounded-xl text-sm font-medium text-center">
                      Mensaje enviado correctamente. Te contactaremos pronto.
                    </div>
                  )}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium tracking-wide text-bar-900">Nombre Completo</label>
                      <input value={formName} onChange={(e) => setFormName(e.target.value)} required className="w-full bg-content-50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-bar-500 outline-none transition-all" placeholder="Ej. Juan Pérez" type="text" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium tracking-wide text-bar-900">Correo Electrónico</label>
                      <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required className="w-full bg-content-50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-bar-500 outline-none transition-all" placeholder="juan@ejemplo.com" type="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium tracking-wide text-bar-900">Programa de Interés</label>
                    <select value={formProgram} onChange={(e) => setFormProgram(e.target.value)} required className="w-full bg-content-50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-bar-500 outline-none transition-all">
                      <option>Seleccione una opción</option>
                      <option>Cursos Básicos</option>
                      <option>Cursos Avanzados</option>
                      <option>Diplomados</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium tracking-wide text-bar-900">Mensaje</label>
                    <textarea value={formMessage} onChange={(e) => setFormMessage(e.target.value)} required className="w-full bg-content-50 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-bar-500 outline-none transition-all" placeholder="¿En qué podemos ayudarte?" rows={4} />
                  </div>
                  <button className="w-full bg-bar-900 text-white py-4 rounded-xl font-bold hover:bg-bar-900/90 transition-all shadow-lg" type="submit">
                    Enviar Mensaje
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-bar-900 py-12 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-4 md:px-10 max-w-7xl mx-auto gap-4">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <img src="/logovector.svg" alt="InnovaSalud" className="h-10 w-auto brightness-0 invert" />
              <span className="text-2xl font-black text-white">InnovaSalud</span>
            </div>
            <p className="text-base text-white/70 text-center md:text-left">© 2024 InnovaSalud. Transformando la educación en salud.</p>
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
    </div>
  )
}
