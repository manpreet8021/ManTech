import { Outlet } from 'react-router-dom'
import AppSidebar from '../components/AppSidebar'

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AppSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
