import { config } from '../config'
import { filenameFromContentDisposition } from './contentDisposition'

export async function downloadTaskFile(taskId: number): Promise<void> {
  try {
    const res = await fetch(`${config.apiUrl}/tasks/${taskId}/file`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error()
    const blob = await res.blob()
    const disposition = res.headers.get('content-disposition')
    const filename = filenameFromContentDisposition(disposition, `task-${taskId}`)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch {
    // silent
  }
}
