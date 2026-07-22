import { useState } from 'react'
import Modal from './Modal'
import { useCreateCourseMutation } from '../store/slice/api/courseApiSlice'
import { useGetAllManagersQuery } from '../store/slice/api/userApiSlice'

export default function CreateCourseModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [managerIds, setManagerIds] = useState([])
  const { data: managers } = useGetAllManagersQuery()
  const [createCourse, { isLoading, error }] = useCreateCourseMutation()

  const toggleManager = (id) => {
    setManagerIds((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createCourse({ name: title, description, manager_ids: managerIds }).unwrap()
      setTitle('')
      setDescription('')
      setManagerIds([])
      onCreate()
    } catch {
      // failure is already surfaced below via `error`
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create a new course">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="course-title" className="mb-1.5 block text-sm font-medium text-slate-700">
            Course title
          </label>
          <input
            id="course-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Class 10 Mathematics"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="course-description" className="mb-1.5 block text-sm font-medium text-slate-700">
            Description <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="course-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this course covers"
            className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-700">
            Managers <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <div className="space-y-1.5">
            {(managers ?? []).map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={managerIds.includes(m.id)}
                  onChange={() => toggleManager(m.id)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {m.name}
              </label>
            ))}
            {(managers ?? []).length === 0 && (
              <p className="text-xs text-slate-400">No managers yet — assign the Manager role to a user first.</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-500">
            {error.data?.message || 'Something went wrong. Please try again.'}
          </p>
        )}

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
            disabled={isLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isLoading ? 'Creating…' : 'Create course'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
