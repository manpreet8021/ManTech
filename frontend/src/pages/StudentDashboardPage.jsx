import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/Navbar'
import StatusBadge from '../components/StatusBadge'
import { mockVideos, getEnrolledCourseIdsForEmail } from '../data/mockData'
import { getYoutubeThumbnail } from '../utils/youtube'

export default function StudentDashboardPage() {
  const email = useSelector((state) => state.auth.user)

  // TODO: replace with a real RTK Query hook, e.g. useGetVideosQuery(), once the
  // Node backend can scope videos to the logged-in student's enrolled courses.
  const enrolledCourseIds = getEnrolledCourseIdsForEmail(email)
  const videos = mockVideos.filter((v) => enrolledCourseIds.includes(v.course_id))

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Your lectures</h1>
        <p className="mt-1 text-sm text-slate-500">
          Videos your teacher has shared, with summaries and quizzes once processing finishes.
        </p>

        {videos.length === 0 && (
          <p className="mt-10 rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
            No lectures yet — ask your teacher to invite you to a course.
          </p>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => {
            const thumbnail = getYoutubeThumbnail(video.url)
            const isReady = video.status === 'ready'

            const card = (
              <div className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                  {thumbnail && (
                    <img
                      src={thumbnail}
                      alt={video.name}
                      className={`h-full w-full object-cover transition ${
                        isReady ? 'group-hover:scale-105' : 'opacity-60 grayscale'
                      }`}
                    />
                  )}
                  {isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 opacity-0 shadow transition group-hover:opacity-100">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5 text-slate-900">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold leading-snug text-slate-900">{video.name}</h2>
                  </div>
                  <StatusBadge status={video.status} />
                  {!isReady && (
                    <p className="mt-2 text-xs text-slate-400">
                      We'll let you know once this is ready to watch.
                    </p>
                  )}
                </div>
              </div>
            )

            return isReady ? (
              <Link key={video.video_id} to={`/student/videos/${video.video_id}`}>
                {card}
              </Link>
            ) : (
              <div key={video.video_id} className="cursor-not-allowed">
                {card}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
