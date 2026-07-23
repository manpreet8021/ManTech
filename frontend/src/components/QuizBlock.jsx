import { useState } from 'react'
import MarkdownContent from './MarkdownContent'

export default function QuizBlock({ questions }) {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const handleSelect = (questionIndex, option) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }))
  }

  const score = questions.reduce(
    (total, q, i) => total + (answers[i] === q.answer ? 1 : 0),
    0,
  )
  const allAnswered = questions.every((_, i) => answers[i] != null)

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => {
        const selected = answers[qIndex]

        return (
          <div key={qIndex} className="rounded-xl border border-slate-200 p-5">
            <p className="mb-4 text-sm font-medium text-slate-900">
              {qIndex + 1}. <MarkdownContent text={q.question} inline />
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.options.map((option) => {
                const isSelected = selected === option
                const isCorrectOption = option === q.answer

                let optionStyle = 'border-slate-200 hover:border-slate-300 text-slate-700'
                if (submitted) {
                  if (isCorrectOption) {
                    optionStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  } else if (isSelected && !isCorrectOption) {
                    optionStyle = 'border-rose-300 bg-rose-50 text-rose-700'
                  } else {
                    optionStyle = 'border-slate-200 text-slate-400'
                  }
                } else if (isSelected) {
                  optionStyle = 'border-indigo-400 bg-indigo-50 text-indigo-800'
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(qIndex, option)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm transition ${optionStyle}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
        {submitted ? (
          <p className="text-sm font-medium text-slate-900">
            You scored {score} / {questions.length}
          </p>
        ) : (
          <p className="text-sm text-slate-500">
            {Object.keys(answers).length} / {questions.length} answered
          </p>
        )}

        {!submitted && (
          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Submit quiz
          </button>
        )}
      </div>
    </div>
  )
}
