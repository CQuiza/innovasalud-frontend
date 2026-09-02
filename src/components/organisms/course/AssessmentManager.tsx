import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../../context/AuthContext'
import { useModuleAssessment, useUpsertAssessment, useDeleteAssessment } from '../../../hooks/useModuleAssessments'
import Modal from '../../molecules/Modal'
import Button from '../../atoms/Button'
import Input from '../../atoms/Input'
import { getErrorMessage } from '../../../lib/error'
import { FaPlus, FaTrashAlt, FaPencilAlt } from 'react-icons/fa'
import type { AssessmentOptionWithCorrect } from '../../../types/moduleAssessment'

interface AssessmentManagerProps {
  moduleId: number | null
  onClose: () => void
}

interface QuestionForm {
  question_text: string
  question_type: 'multiple_choice' | 'true_false'
  points: number
  order_index: number
  options: { option_text: string; is_correct: boolean }[]
}

export default function AssessmentManager({ moduleId, onClose }: AssessmentManagerProps) {
  const { user } = useAuth()
  const canManage = user && ['superuser', 'admin', 'teacher'].includes(user.role)
  const { data: assessment, isLoading } = useModuleAssessment(moduleId ?? 0)
  const upsertAssessment = useUpsertAssessment()
  const deleteAssessment = useDeleteAssessment()

  const [editing, setEditing] = useState(false)
  const [passingScore, setPassingScore] = useState(70)
  const [questions, setQuestions] = useState<QuestionForm[]>([])

  function startEdit() {
    if (assessment) {
      setPassingScore(assessment.passing_score)
      setQuestions(
        assessment.questions.map((q) => ({
          question_text: q.question_text,
          question_type: q.question_type as 'multiple_choice' | 'true_false',
          points: q.points,
          order_index: q.order_index,
          options: q.options.map((o) => ({
            option_text: o.option_text,
            is_correct: (o as AssessmentOptionWithCorrect).is_correct ?? false,
          })),
        }))
      )
    } else {
      setPassingScore(70)
      setQuestions([])
    }
    setEditing(true)
  }

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        order_index: prev.length + 1,
        options: [
          { option_text: '', is_correct: false },
          { option_text: '', is_correct: false },
        ],
      },
    ])
  }

  function updateQuestion(index: number, field: keyof QuestionForm, value: unknown) {
    setQuestions((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function updateOption(questionIndex: number, optionIndex: number, field: string, value: unknown) {
    setQuestions((prev) => {
      const next = [...prev]
      const options = [...next[questionIndex].options]
      options[optionIndex] = { ...options[optionIndex], [field]: value }
      next[questionIndex] = { ...next[questionIndex], options }
      return next
    })
  }

  function addOption(qIndex: number) {
    setQuestions((prev) => {
      const next = [...prev]
      if (next[qIndex].options.length < 4) {
        next[qIndex] = {
          ...next[qIndex],
          options: [...next[qIndex].options, { option_text: '', is_correct: false }],
        }
      }
      return next
    })
  }

  function removeOption(qIndex: number, oIndex: number) {
    setQuestions((prev) => {
      const next = [...prev]
      if (next[qIndex].options.length > 2) {
        const options = next[qIndex].options.filter((_, i) => i !== oIndex)
        next[qIndex] = { ...next[qIndex], options }
      }
      return next
    })
  }

  function handleTypeChange(qIndex: number, qtype: 'multiple_choice' | 'true_false') {
    setQuestions((prev) => {
      const next = [...prev]
      if (qtype === 'true_false') {
        next[qIndex] = {
          ...next[qIndex],
          question_type: qtype,
          options: [
            { option_text: 'Verdadero', is_correct: false },
            { option_text: 'Falso', is_correct: false },
          ],
        }
      } else {
        next[qIndex] = {
          ...next[qIndex],
          question_type: qtype,
          options: [
            { option_text: '', is_correct: false },
            { option_text: '', is_correct: false },
          ],
        }
      }
      return next
    })
  }

  async function handleSave() {
    if (!moduleId) return
    const valid = questions.every(
      (q) => q.question_text.trim() && q.options.every((o) => o.option_text.trim()) && q.options.some((o) => o.is_correct)
    )
    if (!valid) {
      toast.error('Todas las preguntas deben tener texto, opciones con texto y al menos una correcta')
      return
    }
    try {
      await upsertAssessment.mutateAsync({
        moduleId,
        data: { passing_score: passingScore, questions },
      })
      toast.success('Evaluación guardada correctamente')
      setEditing(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!assessment) return
    try {
      await deleteAssessment.mutateAsync(assessment.id)
      toast.success('Evaluación eliminada')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  return (
    <Modal open={moduleId !== null} onClose={onClose} title="Evaluación del módulo">
      {isLoading ? (
        <p className="text-muted small">Cargando...</p>
      ) : !editing ? (
        <div>
          {assessment ? (
            <div>
              <p className="small">
                <strong>Puntaje de aprobación:</strong> {assessment.passing_score}%
              </p>
              <p className="small">
                <strong>Preguntas:</strong> {assessment.questions.length}
              </p>
              {canManage && (
                <div className="d-flex gap-2 mt-3">
                  <Button onClick={startEdit}><FaPencilAlt className="me-1" />Editar</Button>
                  <Button variant="danger" onClick={handleDelete} loading={deleteAssessment.isPending}>
                    <FaTrashAlt className="me-1" />Eliminar
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-muted small mb-3">Este módulo no tiene evaluación configurada.</p>
              {canManage && <Button onClick={startEdit}><FaPlus className="me-1" />Configurar evaluación</Button>}
            </div>
          )}
        </div>
      ) : (
        <div>
          <Input
            label="Puntaje de aprobación (%)"
            type="number"
            min={1}
            max={100}
            value={passingScore}
            onChange={(e) => setPassingScore(Number(e.target.value))}
          />

          <hr />
          <div className="d-flex align-items-center justify-content-between mb-2">
            <p className="small fw-semibold mb-0">Preguntas</p>
            <Button onClick={addQuestion}><FaPlus className="me-1" />Agregar</Button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} className="border rounded-2 p-3 mb-3">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <p className="small fw-semibold mb-0">Pregunta {qi + 1}</p>
                <button onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))} className="btn btn-sm btn-outline-danger"><FaTrashAlt /></button>
              </div>

              <div className="mb-2">
                <label className="form-label small text-secondary">Tipo</label>
                <select
                  className="form-select"
                  value={q.question_type}
                  onChange={(e) => handleTypeChange(qi, e.target.value as 'multiple_choice' | 'true_false')}
                >
                  <option value="multiple_choice">Opción múltiple</option>
                  <option value="true_false">Verdadero / Falso</option>
                </select>
              </div>

              <Input
                label="Texto de la pregunta"
                value={q.question_text}
                onChange={(e) => updateQuestion(qi, 'question_text', e.target.value)}
                placeholder="Ej: ¿Cuál es la capital de Francia?"
              />

              <Input
                label="Puntos"
                type="number"
                min={1}
                value={q.points}
                onChange={(e) => updateQuestion(qi, 'points', Number(e.target.value))}
              />

              <label className="form-label small text-secondary mt-2">Opciones</label>
              {q.options.map((o, oi) => (
                <div key={oi} className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type={q.question_type === 'true_false' ? 'radio' : 'radio'}
                    name={`correct-${qi}`}
                    checked={o.is_correct}
                    onChange={() => {
                      const newOpts = q.options.map((opt, i) => ({ ...opt, is_correct: i === oi }))
                      setQuestions((prev) => {
                        const next = [...prev]
                        next[qi] = { ...next[qi], options: newOpts }
                        return next
                      })
                    }}
                  />
                  <input
                    className="form-control form-control-sm"
                    value={o.option_text}
                    onChange={(e) => updateOption(qi, oi, 'option_text', e.target.value)}
                    placeholder={q.question_type === 'true_false' ? (oi === 0 ? 'Verdadero' : 'Falso') : `Opción ${oi + 1}`}
                    disabled={q.question_type === 'true_false'}
                  />
                  {q.question_type === 'multiple_choice' && q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="btn btn-sm btn-outline-danger"><FaTrashAlt /></button>
                  )}
                </div>
              ))}
              {q.question_type === 'multiple_choice' && q.options.length < 4 && (
                <button onClick={() => addOption(qi)} className="btn btn-sm btn-outline-secondary mt-1">+ Añadir opción</button>
              )}
            </div>
          ))}

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
            <Button onClick={handleSave} loading={upsertAssessment.isPending}>Guardar evaluación</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
