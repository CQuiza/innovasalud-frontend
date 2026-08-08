export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  hideCoursesForAdmin: import.meta.env.VITE_HIDE_COURSES_FOR_ADMIN?.toLowerCase() === 'true',
  showTeacherRole: import.meta.env.VITE_SHOW_TEACHER_ROLE?.toLowerCase() === 'true',
  appName: import.meta.env.VITE_APP_NAME || 'InnovaSalud',
  appDescription: import.meta.env.VITE_APP_DESCRIPTION || 'Plataforma de Certificación',
  contactPhone: import.meta.env.VITE_CONTACT_PHONE || '+57 312 537 0218',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'contacto@innovasalud.com',
  cityCountry: import.meta.env.VITE_CONTACT_CITY_COUNTRY || 'Neiva, Colombia',
} as const
