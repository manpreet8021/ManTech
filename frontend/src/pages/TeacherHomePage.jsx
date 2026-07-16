import StatTile from '../components/StatTile'
import AreaTrendChart from '../components/AreaTrendChart'
import { getTeacherStats, mockAnalytics } from '../data/mockData'

export default function TeacherHomePage() {
  // TODO: replace with real RTK Query hooks, e.g. useGetTeacherStatsQuery() / useGetTeacherAnalyticsQuery()
  const stats = getTeacherStats()

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Home</h1>
      <p className="mt-1 text-sm text-slate-500">How your courses and students are doing.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Students" value={stats.totalStudents} hint={`${stats.pendingInvites} invite(s) pending`} />
        <StatTile label="Courses" value={stats.totalCourses} />
        <StatTile label="Videos" value={stats.totalVideos} hint={`${stats.readyVideos} ready`} />
        <StatTile
          label="Watch time (7d)"
          value={`${Math.round(
            mockAnalytics.dailyWatchMinutes.slice(-7).reduce((sum, d) => sum + d.minutes, 0) / 60,
          )}h`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Daily student joins</h2>
          <p className="text-xs text-slate-400">New students accepting an invite, last 14 days</p>
          <div className="mt-4">
            <AreaTrendChart
              data={mockAnalytics.dailySignups}
              dataKey="count"
              xKey="date"
              color="#2a78d6"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Daily watch time</h2>
          <p className="text-xs text-slate-400">Total minutes watched across all students, last 14 days</p>
          <div className="mt-4">
            <AreaTrendChart
              data={mockAnalytics.dailyWatchMinutes}
              dataKey="minutes"
              xKey="date"
              color="#1baf7a"
              unit="min"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
