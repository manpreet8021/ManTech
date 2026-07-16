import { Outlet } from 'react-router-dom'
import TeacherSidebar from '../components/TeacherSidebar'

export default function TeacherLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
