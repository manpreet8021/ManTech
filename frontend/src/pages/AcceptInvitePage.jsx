import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import { getCourseById, getInviteById } from '../data/mockData'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // TODO: replace with a real RTK Query hook, e.g. useGetInviteByTokenQuery(token)
  const invite = getInviteById(token)
  const course = invite ? getCourseById(invite.course_id) : null

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')

  if (!invite || invite.status === 'accepted') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-sm text-center">
          <p className="text-sm text-slate-500">
            {invite
              ? 'This invite has already been used. Just log in instead.'
              : "This invite link isn't valid — ask your teacher for a new one."}
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-indigo-600">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: replace with a real RTK Query mutation, e.g.
    // acceptInvite({ token, name, password }) which marks the invite accepted
    // and creates the student's account server-side.
    dispatch(setCredentials({ user: invite.email, role: 'student' }))
    navigate('/student')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">
            M
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">You're invited!</h1>
          <p className="mt-1 text-sm text-slate-500">
            {course ? (
              <>
                Join <span className="font-medium text-slate-700">{course.title}</span> on ManTech
              </>
            ) : (
              'Set up your account to get started'
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                disabled
                value={invite.email}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>

            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Asha Verma"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Choose a password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Accept invite & join
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
