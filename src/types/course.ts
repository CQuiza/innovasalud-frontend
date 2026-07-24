import type { CourseStatus } from './enums'

export interface CourseCreate {
  title: string
  description?: string | null
  certificate_type_id?: number | null
  teacher_id?: number | null
  status?: CourseStatus
  preset_image?: string | null
}

export interface CourseUpdate {
  title?: string
  description?: string | null
  certificate_type_id?: number | null
  teacher_id?: number | null
  status?: CourseStatus
  preset_image?: string | null
}

export interface Course {
  id: number
  title: string
  description: string | null
  certificate_type_id: number | null
  teacher_id: number | null
  preset_image: string | null
  image_url: string | null
  created_at: string
  updated_at: string
  status: CourseStatus
}

export interface CoursePublic {
  id: number
  title: string
  description: string | null
  preset_image: string | null
  image_url: string | null
  status: CourseStatus
}
