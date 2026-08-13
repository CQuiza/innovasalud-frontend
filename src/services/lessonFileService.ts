import api from './api'
import { config } from '../config'
import type { LessonFile } from '../types'

export const lessonFileService = {
  listByLesson: async (lessonId: number): Promise<LessonFile[]> => {
    const { data } = await api.get<LessonFile[]>(`/lessons/${lessonId}/files`)
    return data
  },

  create: async (lessonId: number, payload: { original_filename: string; mime_type?: string; order_index?: number }): Promise<LessonFile> => {
    const { data } = await api.post<LessonFile>(`/lessons/${lessonId}/files`, payload)
    return data
  },

  remove: async (lessonId: number, fileId: number): Promise<void> => {
    await api.delete(`/lessons/${lessonId}/files/${fileId}`)
  },

  uploadFile: async (lessonId: number, fileId: number, file: File): Promise<LessonFile> => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<LessonFile>(`/lessons/${lessonId}/files/${fileId}/upload`, form)
    return data
  },

  getFileUrl: (lessonId: number, fileId: number, download?: boolean): string => {
    const base = `${config.apiUrl}/lessons/${lessonId}/files/${fileId}/file`
    return download ? `${base}?download=true` : base
  },

  uploadFilesToLesson: async (
    lessonId: number,
    files: File[]
  ): Promise<{ uploaded: string[]; failed: string[] }> => {
    const uploaded: string[] = []
    const failed: string[] = []

    for (const file of files) {
      try {
        const meta = await lessonFileService.create(lessonId, {
          original_filename: file.name,
          mime_type: file.type || undefined,
        })
        await lessonFileService.uploadFile(lessonId, meta.id, file)
        uploaded.push(file.name)
      } catch {
        failed.push(file.name)
      }
    }

    return { uploaded, failed }
  },
}
