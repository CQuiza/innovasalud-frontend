import { config } from '../config'
import { filenameFromContentDisposition } from '../lib/contentDisposition'
import api from './api'
import type { TaskSubmission, TaskSubmissionWithUser } from '../types'

export const taskSubmissionService = {
  submit: (taskId: number, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post<TaskSubmission>(`/tasks/${taskId}/submit`, fd).then((r) => r.data)
  },

  listByTask: (taskId: number) =>
    api.get<TaskSubmissionWithUser[]>(`/tasks/${taskId}/submissions`).then((r) => r.data),

  getMySubmission: (taskId: number) =>
    api.get<TaskSubmission | null>(`/tasks/${taskId}/my-submission`).then((r) => r.data),

  getFileUrl: (submissionId: number) =>
    `${config.apiUrl}/submissions/${submissionId}/file`,

  downloadFile: async (submissionId: number, preferredName?: string) => {
    const res = await fetch(`${config.apiUrl}/submissions/${submissionId}/file`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al descargar el archivo')
    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    const filename = filenameFromContentDisposition(
      disposition,
      preferredName || `submission-${submissionId}.pdf`,
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
