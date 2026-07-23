import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MarkdownContent from '../components/MarkdownContent'
import { useGetVideoDetailQuery } from '../store/slice/api/videoApiSlice'
import { getYoutubeEmbedUrl } from '../utils/youtube'

function SectionCard({ icon, title, subtitle, badge, children, headerAction }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {headerAction}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function ProcessingNote({ label }) {
  return (
    <p className="flex items-center gap-2 text-sm text-slate-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      {label} not available yet — still processing.
    </p>
  )
}

function QuizReview({ questions }) {
  return (
    <div className="space-y-4">
      {questions.map((q, qIndex) => (
        <div key={q.id ?? qIndex} className="rounded-xl border border-slate-200 p-4">
          <p className="mb-3 text-sm font-medium text-slate-900">
            {qIndex + 1}. <MarkdownContent text={q.question} inline />
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((option) => {
              const isCorrect = option === q.answer

              return (
                <div
                  key={option}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                    isCorrect
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {isCorrect ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />
                  )}
                  {option}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function VideoDetailPage() {
  const { courseId, videoId } = useParams()
  const { data: video, isLoading, error } = useGetVideoDetailQuery(videoId)
  const [translationOpen, setTranslationOpen] = useState(false)

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading…</p>
  }

  if (error || !video) {
    return (
      <div className="text-center">
        <p className="text-slate-500">
          {error?.data?.message || 'Video not found.'}
        </p>
        <Link to={`/courses/${courseId}`} className="mt-4 inline-block text-sm font-medium text-indigo-600">
          Back to course
        </Link>
      </div>
    )
  }

  const embedUrl = getYoutubeEmbedUrl(video.url)

  return (
    <div>
      <Link
        to={`/courses/${courseId}`}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to course
      </Link>

      <h1 className="mb-4 text-xl font-semibold text-slate-900">{video.name}</h1>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">
        <div className="aspect-video w-full">
          {embedUrl ? (
            <iframe
              className="h-full w-full"
              src={embedUrl}
              title={video.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Video unavailable
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <SectionCard
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
            </svg>
          }
          title="Summary"
          subtitle="AI-generated overview of this lecture, from your uploaded video."
        >
          {video.summary ? <MarkdownContent text={video.summary} /> : <ProcessingNote label="Summary" />}
        </SectionCard>

        <SectionCard
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a1.5 1.5 0 112.12 2.12c-.4.4-.94.66-1.06 1.28-.02.1-.03.28-.03.51a.75.75 0 001.5 0v-.036a2.24 2.24 0 01.61-.97l.14-.14a3 3 0 10-4.5-3.9.75.75 0 001.2.9c.02-.03.03-.05.03-.05zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          }
          title="Quiz"
          subtitle="Answer key for the auto-generated quiz — this is a review view, not the student-facing one."
          badge={
            video.quiz?.length ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                {video.quiz.length} question{video.quiz.length === 1 ? '' : 's'}
              </span>
            ) : null
          }
        >
          {video.quiz?.length ? <QuizReview questions={video.quiz} /> : <ProcessingNote label="Quiz" />}
        </SectionCard>

        <SectionCard
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 4.5c.69 1.02 1.17 2.36 1.37 3.75H8.63c.2-1.39.68-2.73 1.37-3.75zM7.1 8.25c.2-1.55.72-2.96 1.46-4.06a6.52 6.52 0 00-3.98 4.06H7.1zm-2.85 1.5h2.98a10.9 10.9 0 000 2.5H4.25a6.47 6.47 0 010-2.5zm1.33 4h2.52c.2 1.55.72 2.96 1.46 4.06a6.52 6.52 0 01-3.98-4.06zm4.05 4.06c-.74-1.1-1.26-2.51-1.46-4.06h2.92c-.2 1.55-.72 2.96-1.46 4.06zm2.74-4.06h2.92c-.2 1.55-.72 2.96-1.46 4.06-.74-1.1-1.26-2.51-1.46-4.06zm4.35-1.5a10.9 10.9 0 000-2.5h2.98a6.47 6.47 0 010 2.5h-2.98zm2.4-4h-2.98c-.2-1.55-.72-2.96-1.46-4.06a6.52 6.52 0 014.44 4.06zM11.44 9.75a9.4 9.4 0 010 2.5H8.56a9.4 9.4 0 010-2.5h2.88z"
                clipRule="evenodd"
              />
            </svg>
          }
          title="Translation"
          subtitle="Full translated transcript."
          headerAction={
            video.translation && (
              <button
                type="button"
                onClick={() => setTranslationOpen((open) => !open)}
                className="flex shrink-0 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                {translationOpen ? 'Collapse' : 'Expand'}
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 transition-transform ${translationOpen ? 'rotate-180' : ''}`}
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )
          }
        >
          {video.translation ? (
            translationOpen ? (
              <MarkdownContent text={video.translation} />
            ) : (
              <p className="line-clamp-2 text-sm text-slate-400">{video.translation}</p>
            )
          ) : (
            <ProcessingNote label="Translation" />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
