import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { useModules } from '../../../hooks/useModules'
import { useLessons } from '../../../hooks/useLessons'
import { moduleService } from '../../../services/moduleService'
import { lessonService } from '../../../services/lessonService'
import { lessonFileService } from '../../../services/lessonFileService'
import Card from '../../molecules/Card'
import Button from '../../atoms/Button'
import Skeleton from '../../atoms/Skeleton'
import { getErrorMessage } from '../../../lib/error'
import {
  FaChevronDown, FaChevronRight, FaEye, FaVideo, FaImage, FaFile, FaFilePdf,
  FaBookOpen, FaPlus, FaPencilAlt, FaTrashAlt, FaClipboardList, FaClipboardCheck,
} from 'react-icons/fa'
import ModuleFormModal from './ModuleFormModal'
import LessonFormModal from './LessonFormModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import TaskManager from './TaskManager'
import AssessmentManager from './AssessmentManager'
import AssessmentView from './AssessmentView'
import type { Module, Lesson, ModuleUpdate, LessonUpdate } from '../../../types'

interface ModuleManagerProps { courseId: number; canManage: boolean }

function contentTypeIcon(l: { video_content_url?: string | null; image_content_url?: string | null; file_content_url?: string | null }) {
  if (l.video_content_url) return <FaVideo className="text-danger-500" />
  if (l.image_content_url) return <FaImage className="text-warning-500" />
  if (l.file_content_url) return <FaFile className="text-info-500" />
  return <FaFilePdf className="text-muted" />
}

export default function ModuleManager({ courseId, canManage }: ModuleManagerProps) {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const qc = useQueryClient()
  const { data: modules, isLoading: loadingModules } = useModules({ course_id: courseId })
  const [expandedModule, setExpandedModule] = useState<number | null>(null)
  const { data: lessons, isLoading: loadingLessons } = useLessons({ module_id: expandedModule ?? 0 }, { enabled: expandedModule !== null })

  const createModule = useMutation({ mutationFn: (data: { course_id: number; title: string; order_index: number }) => moduleService.create(data), onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }) })
  const updateModule = useMutation({ mutationFn: ({ id, data }: { id: number; data: ModuleUpdate }) => moduleService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }) })
  const deleteModule = useMutation({ mutationFn: (id: number) => moduleService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['modules'] }) })
  const createLesson = useMutation({ mutationFn: (data: Record<string, unknown>) => lessonService.create(data as unknown as Lesson), onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }) })
  const updateLesson = useMutation({ mutationFn: ({ id, data }: { id: number; data: LessonUpdate }) => lessonService.update(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }) })
  const deleteLesson = useMutation({ mutationFn: (id: number) => lessonService.remove(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons'] }) })

  const [modModal, setModModal] = useState(false)
  const [editingMod, setEditingMod] = useState<Module | null>(null)
  const [lessonModal, setLessonModal] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonModuleId, setLessonModuleId] = useState(0)
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'module' | 'lesson'; id: number } | null>(null)
  const [taskModalLessonId, setTaskModalLessonId] = useState<number | null>(null)
  const [assessmentModalModuleId, setAssessmentModalModuleId] = useState<number | null>(null)
  const [viewingAssessmentModuleId, setViewingAssessmentModuleId] = useState<number | null>(null)
  const [lessonSubmitting, setLessonSubmitting] = useState(false)
  const modulesSorted = Array.isArray(modules) ? [...modules].sort((a, b) => a.order_index - b.order_index) : []

  async function handleModSubmit(data: { title: string; order_index: number }) {
    try {
      if (editingMod) { await updateModule.mutateAsync({ id: editingMod.id, data }); toast.success('Módulo actualizado correctamente') }
      else { await createModule.mutateAsync({ course_id: courseId, ...data }); toast.success('Módulo creado correctamente') }
      setModModal(false); setEditingMod(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  async function handleLessonSubmit(data: { title: string; text_content: string; image_content_url: string; video_content_url: string; file_content_url: string; order_index: number }, files: File[] = []) {
    const payload = { title: data.title, text_content: data.text_content || null, image_content_url: data.image_content_url || null, video_content_url: data.video_content_url || null, file_content_url: data.file_content_url || null, order_index: data.order_index }
    setLessonSubmitting(true)
    try {
      if (editingLesson) { await updateLesson.mutateAsync({ id: editingLesson.id, data: payload }); toast.success('Lección actualizada correctamente') }
      else {
        const created = await createLesson.mutateAsync({ module_id: lessonModuleId, ...payload }) as unknown as Lesson
        if (files.length > 0) {
          toast.info(`Subiendo ${files.length} archivo${files.length !== 1 ? 's' : ''} a la lección...`)
          const { uploaded, failed } = await lessonFileService.uploadFilesToLesson(created.id, files)
          toast.success(`Lección creada correctamente${uploaded.length > 0 ? ` · ${uploaded.length} archivo${uploaded.length !== 1 ? 's' : ''} subido${uploaded.length !== 1 ? 's' : ''}` : ''}`)
          if (failed.length > 0) toast.warning(`${failed.length} archivo${failed.length !== 1 ? 's' : ''} no subido${failed.length !== 1 ? 's' : ''}: ${failed.join(', ')} — puede reintentarlos desde "Editar lección"`)
        } else {
          toast.success('Lección creada correctamente')
        }
      }
      setLessonModal(false); setEditingLesson(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
    finally { setLessonSubmitting(false) }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return
    try {
      if (confirmDelete.type === 'module') { await deleteModule.mutateAsync(confirmDelete.id); toast.success('Módulo eliminado correctamente') }
      else { await deleteLesson.mutateAsync(confirmDelete.id); toast.success('Lección eliminada correctamente') }
      setConfirmDelete(null)
    } catch (err) { toast.error(getErrorMessage(err)) }
  }

  return (
    <>
      {viewingAssessmentModuleId ? (
        <AssessmentView
          moduleId={viewingAssessmentModuleId}
          onBack={() => setViewingAssessmentModuleId(null)}
        />
      ) : (
        <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold text-neutral-800 mb-0">Módulos</h5>
        {canManage && <Button onClick={() => { setEditingMod(null); setModModal(true) }}><FaPlus className="me-1" />Añadir módulo</Button>}
      </div>

      {loadingModules ? (
        <div><Skeleton count={4} className="h-16 w-full" /></div>
      ) : modulesSorted.length === 0 ? (
        <Card><p className="text-center py-4 small text-muted mb-0">Este curso no tiene módulos aún.</p></Card>
      ) : (
        <div>
          {modulesSorted.map((mod) => {
            const expanded = expandedModule === mod.id
            return (
              <Card key={mod.id} padding={false} className="mb-2">
                <div className="d-flex align-items-center justify-content-between">
                  <button onClick={() => setExpandedModule(expanded ? null : mod.id)} className="d-flex flex-grow-1 align-items-center justify-content-between px-4 py-3 text-start border-0 bg-transparent hover-bg-light">
                    <div className="d-flex align-items-center gap-3">
                      <FaBookOpen className="text-bar-500" />
                      <div>
                        <p className="fw-medium text-neutral-800 mb-0">{mod.title}</p>
                        <small className="text-muted">Módulo {mod.order_index}</small>
                      </div>
                    </div>
                    {expanded ? <FaChevronDown className="text-muted" /> : <FaChevronRight className="text-muted" />}
                  </button>
                  {canManage && (
                    <div className="d-flex gap-1 pe-3">
                      <button onClick={(e) => { e.stopPropagation(); setLessonModuleId(mod.id); setEditingLesson(null); setLessonModal(true) }} className="btn btn-sm btn-outline-secondary" title="Añadir lección"><FaPlus /></button>
                      <button onClick={(e) => { e.stopPropagation(); setAssessmentModalModuleId(mod.id) }} className="btn btn-sm btn-outline-secondary" title="Evaluación"><FaClipboardCheck /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingMod(mod); setModModal(true) }} className="btn btn-sm btn-outline-secondary" title="Editar módulo"><FaPencilAlt /></button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'module', id: mod.id }) }} className="btn btn-sm btn-outline-danger" title="Eliminar módulo"><FaTrashAlt /></button>
                    </div>
                  )}
                </div>
                {expanded && (
                  <div className="border-top">
                    {loadingLessons ? (
                      <div className="p-3"><Skeleton count={3} className="h-12 w-full" /></div>
                    ) : lessons && lessons.length > 0 ? (
                      lessons.map((lesson) => (
                        <div key={lesson.id} className="d-flex align-items-center justify-content-between border-bottom hover-bg-light" >
                          <Link to={`/courses/${courseId}/lessons/${lesson.id}`} className="d-flex flex-grow-1 align-items-center gap-3 px-4 py-3 text-decoration-none text-reset">
                            {contentTypeIcon(lesson)}
                            <div className="flex-grow-1 min-w-0">
                              <p className="small fw-medium text-neutral-800 mb-0">{lesson.title}</p>
                            </div>
                            <FaEye className="text-muted flex-shrink-0" />
                          </Link>
                          {canManage && (
                            <div className="d-flex gap-1 pe-3">
                              <button onClick={(e) => { e.stopPropagation(); setTaskModalLessonId(lesson.id) }} className="btn btn-sm btn-outline-secondary" title="Tareas"><FaClipboardList /></button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingLesson(lesson); setLessonModal(true) }} className="btn btn-sm btn-outline-secondary" title="Editar lección"><FaPencilAlt /></button>
                              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: 'lesson', id: lesson.id }) }} className="btn btn-sm btn-outline-danger" title="Eliminar lección"><FaTrashAlt /></button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="px-4 py-3 small text-muted mb-0">Sin lecciones</p>
                    )}
                    {isStudent && (
                      <div className="border-top px-4 py-2">
                        <button
                          onClick={() => setViewingAssessmentModuleId(mod.id)}
                          className="btn btn-sm btn-outline-bar-600 d-inline-flex align-items-center gap-1"
                        >
                          <FaClipboardCheck /> Tomar evaluación
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <ModuleFormModal
        key={editingMod?.id ?? 'new-mod'}
        open={modModal}
        editing={editingMod}
        loading={createModule.isPending || updateModule.isPending}
        onSubmit={handleModSubmit}
        onClose={() => { setModModal(false); setEditingMod(null) }}
      />

      <LessonFormModal
        key={editingLesson?.id ?? 'new-lesson'}
        open={lessonModal}
        editing={editingLesson}
        loading={createLesson.isPending || updateLesson.isPending || lessonSubmitting}
        onSubmit={handleLessonSubmit}
        onClose={() => { setLessonModal(false); setEditingLesson(null) }}
        lessonId={editingLesson?.id}
      />

      <ConfirmDeleteModal
        open={!!confirmDelete}
        type={confirmDelete?.type ?? 'lesson'}
        loading={deleteModule.isPending || deleteLesson.isPending}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmDelete(null)}
      />

      <TaskManager lessonId={taskModalLessonId} onClose={() => setTaskModalLessonId(null)} />
      <AssessmentManager moduleId={assessmentModalModuleId} onClose={() => setAssessmentModalModuleId(null)} />
        </>
      )}
    </>
  )
}
