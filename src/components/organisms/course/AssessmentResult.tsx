import Button from '../../atoms/Button'
import type { AttemptResult } from '../../../types'

interface AssessmentResultProps {
  result: AttemptResult
  passingScore: number
  onRetry: () => void
  onBack: () => void
}

export default function AssessmentResult({ result, passingScore, onRetry, onBack }: AssessmentResultProps) {
  const passed = result.passed
  const pct = Math.round(result.score)

  return (
    <div>
      <div className="text-center mb-4">
        <div
          className={`d-inline-flex align-items-center justify-content-center rounded-circle fw-bold mb-3`}
          style={{
            width: 100,
            height: 100,
            fontSize: '1.5rem',
            background: passed ? '#d4edda' : '#f8d7da',
            color: passed ? '#155724' : '#721c24',
            border: `4px solid ${passed ? '#28a745' : '#dc3545'}`,
          }}
        >
          {pct}%
        </div>
        <h5 className={passed ? 'text-success' : 'text-danger'}>
          {passed ? '¡Aprobado!' : 'No aprobado'}
        </h5>
        <p className="small text-muted">
          {result.earned_points} / {result.total_points} puntos · Mínimo: {passingScore}%
        </p>
      </div>

      <div className="mb-4">
        <p className="small fw-semibold mb-2">Tus respuestas:</p>
        {result.answers.map((ans) => (
          <div
            key={ans.question_id}
            className={`d-flex align-items-start gap-2 p-3 mb-2 border rounded-2 ${
              ans.is_correct ? 'border-success bg-success-50' : 'border-danger bg-danger-50'
            }`}
          >
            <span className={`fw-bold ${ans.is_correct ? 'text-success' : 'text-danger'}`}>
              {ans.is_correct ? '✓' : '✗'}
            </span>
            <div>
              <p className="small mb-0">{ans.question_text}</p>
              <small className={ans.is_correct ? 'text-success' : 'text-danger'}>
                {ans.is_correct ? 'Correcta' : 'Incorrecta'}
              </small>
              {!ans.is_correct && (
                <div className="mt-1">
                  {ans.selected_option_text && (
                    <small className="d-block text-muted">Tu respuesta: {ans.selected_option_text}</small>
                  )}
                  {ans.correct_option_text && (
                    <small className="d-block text-success fw-medium">Respuesta correcta: {ans.correct_option_text}</small>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center gap-2">
        {!passed && <Button onClick={onRetry}>Intentar de nuevo</Button>}
        <Button variant="secondary" onClick={onBack}>Volver</Button>
      </div>
    </div>
  )
}
