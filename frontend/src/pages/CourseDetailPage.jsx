import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import AddVideoModal from '../components/AddVideoModal'
import InviteStudentModal from '../components/InviteStudentModal'
import { getCourseById, getVideosForCourse, getInvitesForCourse } from '../data/mockData'
import { getYoutubeThumbnail } from '../utils/youtube'

const TABS = [
  { id: 'videos', label: 'Videos' },
  { id: 'students', label: 'Students' },
]

const INVITE_STATUS_STYLES = {
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
}

export default function CourseDetailPage() {
  const { courseId } = useParams()
  // TODO: replace with real RTK Query hooks, e.g. useGetCourseQuery(courseId) / useGetVideosQuery({ courseId })
  const course = getCourseById(courseId)
  const [activeTab, setActiveTab] = useState('videos')
  const [videos, setVideos] = useState(() => getVideosForCourse(courseId))
  const [invites, setInvites] = useState(() => getInvitesForCourse(courseId))
  const [addVideoOpen, setAddVideoOpen] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleAddVideo = ({ name, url, pdf_name }) => {
    // TODO: replace with a real RTK Query mutation; the new video should
    // start life as "pending" until the download scheduler picks it up.
    setVideos((prev) => [
      ...prev,
      {
        video_id: `temp-${Date.now()}`,
        course_id: courseId,
        name,
        url,
        pdf_name,
        status: 'pending',
      },
    ])
    setAddVideoOpen(false)
  }

  const handleInvite = ({ email }) => {
    // TODO: replace with a real RTK Query mutation that creates the invite
    // server-side and emails the student their unique invite link.
    setInvites((prev) => [
      ...prev,
      { invite_id: `temp-${Date.now()}`, email, course_id: courseId, status: 'pending' },
    ])
    setInviteOpen(false)
  }

  if (!course) {
    return (
      <div className="text-center">
        <p className="text-slate-500">Course not found.</p>
        <Link to="/teacher/courses" className="mt-4 inline-block text-sm font-medium text-indigo-600">
          Back to your courses
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/teacher/courses"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
            clipRule="evenodd"
          />
        </svg>
        Back to your courses
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{course.title}</h1>
          {course.description && <p className="mt-1 text-sm text-slate-500">{course.description}</p>}
        </div>
        <button
          onClick={() => (activeTab === 'videos' ? setAddVideoOpen(true) : setInviteOpen(true))}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {activeTab === 'videos' ? 'Add video' : 'Invite student'}
        </button>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-3 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'videos' && (
        <div className="mt-6 space-y-3">
          {videos.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
              No videos yet — add your first one to get started.
            </p>
          )}

          {videos.map((video) => {
            const thumbnail = getYoutubeThumbnail(video.url)

            return (
              <div
                key={video.video_id}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {thumbnail && (
                    <img src={thumbnail} alt={video.name} className="h-full w-full object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{video.name}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <StatusBadge status={video.status} />
                    {video.pdf_name && (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {video.pdf_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="mt-6 space-y-3">
          {invites.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400">
              No students invited yet — invite-only signup means students can only join via a link you send.
            </p>
          )}

          {invites.map((invite) => (
            <div
              key={invite.invite_id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span className="text-sm font-medium text-slate-900">{invite.email}</span>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ${INVITE_STATUS_STYLES[invite.status]}`}
              >
                {invite.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <AddVideoModal open={addVideoOpen} onClose={() => setAddVideoOpen(false)} onAdd={handleAddVideo} />
      <InviteStudentModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite} />
    </div>
  )
}
