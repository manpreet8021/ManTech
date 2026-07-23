import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SummaryBlock from '../components/SummaryBlock'
import QuizBlock from '../components/QuizBlock'
import MarkdownContent from '../components/MarkdownContent'
import { getVideoById } from '../data/mockData'
import { getYoutubeEmbedUrl } from '../utils/youtube'

const TABS = [
  { id: 'summary', label: 'Summary' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'transcript', label: 'Transcript' },
]

export default function VideoPlayerPage() {
  const { videoId } = useParams()
  const [activeTab, setActiveTab] = useState('summary')

  // TODO: replace getVideoById with a real RTK Query hook, e.g. useGetVideoByIdQuery(videoId)
  const video = getVideoById(videoId)

  if (!video) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-slate-500">Video not found.</p>
          <Link to="/student" className="mt-4 inline-block text-sm font-medium text-indigo-600">
            Back to your lectures
          </Link>
        </main>
      </div>
    )
  }

  const embedUrl = getYoutubeEmbedUrl(video.url)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link
          to="/student"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          Back to your lectures
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

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex border-b border-slate-200 px-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-indigo-600" />
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'summary' &&
              (video.summary ? (
                <SummaryBlock text={video.summary} />
              ) : (
                <p className="text-sm text-slate-400">Summary not available yet.</p>
              ))}

            {activeTab === 'quiz' &&
              (video.quiz?.length ? (
                <QuizBlock questions={video.quiz} />
              ) : (
                <p className="text-sm text-slate-400">Quiz not available yet.</p>
              ))}

            {activeTab === 'transcript' &&
              (video.translation ? (
                <MarkdownContent text={video.translation} />
              ) : (
                <p className="text-sm text-slate-400">Transcript not available yet.</p>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}
