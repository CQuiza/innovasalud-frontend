export const LESSON_FILE_ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.ppt', '.pptx', '.txt', '.csv',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
  '.mp4', '.webm', '.avi',
  '.zip', '.rar',
])

export const LESSON_FILE_MAX_SIZE_MB = 50
export const LESSON_FILE_MAX_SIZE_BYTES = LESSON_FILE_MAX_SIZE_MB * 1024 * 1024

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

export function isAllowedLessonFile(file: File): boolean {
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  return LESSON_FILE_ALLOWED_EXTENSIONS.has(ext)
}