import { useState } from 'react'
import { useCourses } from '../hooks/useCourses'
import { Link } from 'react-router-dom'
import Skeleton from '../components/atoms/Skeleton'
import ImageLightbox from '../components/molecules/ImageLightbox'
import PublicFooter from '../components/organisms/PublicFooter'
import { config } from '../config'
import { FaGraduationCap, FaClock } from 'react-icons/fa'

export default function CatalogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: courses, isLoading } = useCourses({ limit: 50 })
  const published = (courses || []).filter((c) => c.status === 'published')

  return (
    <div className="min-h-screen bg-content-50">
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-200/30 shadow-sm">
        <nav className="flex justify-between items-center w-full px-4 md:px-10 h-20 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-4">
            <img src="/logo.png" alt="InnovaSalud" className="h-30 w-auto" />
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

      <section className="bg-gradient-to-r from-bar-600 to-bar-800 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h1 className="text-3xl font-bold text-white">Catálogo de Cursos</h1>
          <p className="mt-2 text-bar-200">Explora los cursos disponibles y encuentra el que mejor se ajuste a tus necesidades</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : published.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <FaGraduationCap className="mx-auto h-12 w-12 text-neutral-300" />
            <p className="mt-4 text-lg font-medium text-neutral-600">No hay cursos disponibles por el momento</p>
            <p className="mt-1 text-sm text-neutral-400">Vuelve a consultar más tarde.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {published.map((course) => (
              <div key={course.id} className="group rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-md overflow-hidden">
                {course.preset_image ? (
                  <ImageLightbox
                    src={`/courses_images/${course.preset_image}.png`}
                    alt={course.title}
                    className="w-100"
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                ) : course.image_url ? (
                  <ImageLightbox
                    src={`${config.apiUrl}/courses/${course.id}/image`}
                    alt={course.title}
                    className="w-100"
                    style={{ height: 160, objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <ImageLightbox
                    src="/default-course-image.png"
                    alt={course.title}
                    className="w-100"
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                )}
                <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-bar-600 transition-colors">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 text-sm text-neutral-500 line-clamp-3 text-justify">{course.description}</p>
                )}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-neutral-400">
                  <FaClock className="h-3.5 w-3.5" />
                  <span>Curso disponible</span>
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
      </section>

      <PublicFooter />
    </div>
  )
}
