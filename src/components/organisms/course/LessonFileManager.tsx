import { useLessonFiles, useCreateLessonFile, useUploadLessonFile, useDeleteLessonFile } from '../../../hooks/useLessonFiles'
import Skeleton from '../../atoms/Skeleton'
import FileDropzone from '../../molecules/FileDropzone'
import { FaTrashAlt, FaFileAlt } from 'react-icons/fa'
import { toast } from 'sonner'
import { getErrorMessage } from '../../../lib/error'

interface LessonFileManagerProps {
  lessonId: number
}

export default function LessonFileManager({ lessonId }: LessonFileManagerProps) {
  const { data: files, isLoading } = useLessonFiles(lessonId)
  const createFile = useCreateLessonFile()
  const uploadFile = useUploadLessonFile()
  const deleteFile = useDeleteLessonFile()

  async function handleFiles(fileList: File[]) {
    for (const file of fileList) {
      try {
        const created = await createFile.mutateAsync({
          lessonId,
          original_filename: file.name,
          mime_type: file.type,
        })
        await uploadFile.mutateAsync({ lessonId, fileId: created.id, file })
        toast.success('Archivo subido correctamente')
      } catch (err) {
        toast.error(getErrorMessage(err))
      }
    }
  }

  async function handleDelete(fileId: number) {
    try {
      await deleteFile.mutateAsync({ lessonId, fileId })
      toast.success('Archivo eliminado')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label className="form-label small fw-medium text-secondary mb-0">Archivos</label>
      </div>
      <FileDropzone
        multiple
        disabled={createFile.isPending || uploadFile.isPending}
        onFiles={handleFiles}
        hint="Arrastra y suelta o haz clic para subir archivos"
      />

      <div className="mt-2">
        {isLoading ? (
          <Skeleton count={2} className="h-10 w-full" />
        ) : !files || files.length === 0 ? (
          <p className="small text-muted mb-0">Sin archivos adjuntos.</p>
        ) : (
          <div className="space-y-1">
            {files.map((f) => (
              <div key={f.id} className="d-flex align-items-center justify-content-between rounded border px-3 py-2">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <FaFileAlt className="text-bar-500 shrink-0" />
                  <span className="small text-truncate">{f.original_filename || 'Archivo'}</span>
                </div>
                <button
                  onClick={() => handleDelete(f.id)}
                  className="btn btn-sm btn-outline-danger"
                  title="Eliminar archivo"
                  disabled={deleteFile.isPending}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
