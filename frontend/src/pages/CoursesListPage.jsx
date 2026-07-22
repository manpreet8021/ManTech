import { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateCourseModal from '../components/CreateCourseModal'
import { useGetAllCourseQuery } from '../store/slice/api/courseApiSlice'
import { hasPermission } from '../utils/permissions'
import { useSelector } from 'react-redux'

export default function CoursesListPage() {
  useGetAllCourseQuery()
  const courses = useSelector((state) => state.course.course)
  const [modalOpen, setModalOpen] = useState(false)
  const permissions = useSelector((state) => state.auth.permissions)

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your courses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize lectures into courses and track processing status.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className={!hasPermission(permissions, "course", "write") ? "hidden" : "flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New course
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600">
              {course.name}
            </h2>
            {course.description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{course.description}</p>
            )}
            {course.managers?.length > 0 && (
              <p className="mt-4 text-xs font-medium text-slate-400">
                Managers: {course.managers.map((m) => m.name).join(', ')}
              </p>
            )}
          </Link>
        ))}

        {courses.length === 0 && (
          <p className="text-sm text-slate-400">No courses yet — create your first one to get started.</p>
        )}
      </div>

      <CreateCourseModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={() => setModalOpen(false)} />
    </div>
  )
}
