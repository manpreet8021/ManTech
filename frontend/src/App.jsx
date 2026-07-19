import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import VideoPlayerPage from './pages/VideoPlayerPage'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import CoursesListPage from './pages/CoursesListPage'
import CourseDetailPage from './pages/CourseDetailPage'
import UsersPage from './pages/UsersPage'
import AcceptInvitePage from './pages/AcceptInvitePage'
import RequirePermission from './components/RequirePermission'
import RequireAuth from './components/RequireAuth'
import RootRedirect from './components/RootRedirect'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/student/videos/:videoId" element={<VideoPlayerPage />} />

      {/* Shared by admin + teacher roles; requires a session, and nav visibility/route access within it is permission-driven. */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/courses"
          element={
            <RequirePermission resource="course">
              <CoursesListPage />
            </RequirePermission>
          }
        />
        <Route
          path="/courses/:courseId"
          element={
            <RequirePermission resource="course">
              <CourseDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path="/users"
          element={
            <RequirePermission resource="user">
              <UsersPage />
            </RequirePermission>
          }
        />
      </Route>
    </Routes>
  )
}
