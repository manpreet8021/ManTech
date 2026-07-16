import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import StudentDashboardPage from './pages/StudentDashboardPage'
import VideoPlayerPage from './pages/VideoPlayerPage'
import TeacherLayout from './layouts/TeacherLayout'
import TeacherHomePage from './pages/TeacherHomePage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import CourseDetailPage from './pages/CourseDetailPage'
import AcceptInvitePage from './pages/AcceptInvitePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />
      <Route path="/student" element={<StudentDashboardPage />} />
      <Route path="/student/videos/:videoId" element={<VideoPlayerPage />} />

      <Route path="/teacher" element={<TeacherLayout />}>
        <Route index element={<TeacherHomePage />} />
        <Route path="courses" element={<TeacherDashboardPage />} />
        <Route path="courses/:courseId" element={<CourseDetailPage />} />
      </Route>
    </Routes>
  )
}
