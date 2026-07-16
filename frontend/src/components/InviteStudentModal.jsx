import { useState } from 'react'
import Modal from './Modal'

export default function InviteStudentModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: replace with a real RTK Query mutation, e.g. inviteStudent({ email, courseId })
    // which should send the student an email with their unique invite link.
    onInvite({ email })
    setEmail('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite a student">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invite-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Student email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@school.edu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            They'll get a link to set a password and join this course. Students can't sign up without an invite.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Send invite
          </button>
        </div>
      </form>
    </Modal>
  )
}
