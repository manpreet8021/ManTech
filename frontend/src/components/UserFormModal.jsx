import { useEffect, useState } from 'react'
import Modal from './Modal'
import { useSelector } from 'react-redux'

export default function UserFormModal({ open, onClose, onSubmit, user }) {
  const isEdit = Boolean(user)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const roles = useSelector(state => state.rolePermission.roles)

  useEffect(() => {
    if (open) {
      setName(user?.name ?? '')
      setEmail(user?.email ?? '')
      setRole(user?.role ?? '')
    }
  }, [open, user])

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: replace with a real RTK Query mutation. Adding a user should
    // invite them by email (same pattern as student invites) and assign the
    // chosen role once they accept; editing updates the existing user.
    // onSubmit({ name, email, role })
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit user' : 'Add a user'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="user-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Priya Sharma"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="user-email"
            type="email"
            required
            disabled={isEdit}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@school.edu"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
          />
          {!isEdit && (
            <p className="mt-1.5 text-xs text-slate-400">
              They'll get a link to set a password and join with the selected role.
            </p>
          )}
        </div>

        <div>
          <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 capitalize focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {roles && roles.map((r) => (
              <option key={r.id} value={r.id} className="capitalize">
                {r.name}
              </option>
            ))}
          </select>
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
            {isEdit ? 'Save changes' : 'Add user'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
