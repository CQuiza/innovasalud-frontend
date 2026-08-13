import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { FaCloudUploadAlt } from 'react-icons/fa'
import { isAllowedLessonFile, LESSON_FILE_MAX_SIZE_BYTES, LESSON_FILE_MAX_SIZE_MB } from '../../lib/lessonFiles'

function isAllowedFile(file: File): boolean {
  return isAllowedLessonFile(file)
}

interface FileDropzoneProps {
  multiple?: boolean
  disabled?: boolean
  onFiles: (files: File[]) => void
  hint?: string
}

export default function FileDropzone({ multiple = false, disabled = false, onFiles, hint }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  function validateAndForward(files: File[]) {
    const accepted: File[] = []
    for (const file of files) {
      if (!isAllowedFile(file)) {
        toast.error(`"${file.name}": tipo de archivo no permitido`)
        continue
      }
      if (file.size > LESSON_FILE_MAX_SIZE_BYTES) {
        toast.error(`"${file.name}": supera el límite de ${LESSON_FILE_MAX_SIZE_MB} MB`)
        continue
      }
      accepted.push(file)
    }
    if (accepted.length > 0) onFiles(accepted)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (inputRef.current) inputRef.current.value = ''
    if (files.length > 0) validateAndForward(files)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    if (disabled) return
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) validateAndForward(files)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={multiple ? 'Subir archivos' : 'Subir archivo'}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onDragEnter={(e) => { e.preventDefault(); if (!disabled) setDragActive(true) }}
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragActive(true) }}
      onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
      onDrop={handleDrop}
      className={`d-flex flex-column align-items-center justify-content-center rounded-3 border text-center cursor-pointer select-none ${dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-dashed'} ${disabled ? 'opacity-50' : 'hover-bg-light'}`}
      style={{ height: '110px', cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <input ref={inputRef} type="file" multiple={multiple} className="d-none" onChange={handleInputChange} />
      <FaCloudUploadAlt className="text-bar-500 mb-1" size={22} />
      <span className="small fw-medium text-neutral-700">
        {hint ?? 'Arrastra y suelta o haz clic para elegir archivo'}
      </span>
    </div>
  )
}