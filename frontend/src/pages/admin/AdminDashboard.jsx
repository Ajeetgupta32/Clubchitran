import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Compass,
  Calendar,
  CheckCircle,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  PlusCircle,
  CheckSquare,
  Award,
  Trophy,
  Building2,
  ChevronRight
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import ActivityModal from '../../components/ui/ActivityModal';
import api from '../../services/api';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [branchStrength, setBranchStrength] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, strengthRes] = await Promise.all([
        api.get('/stats/admin'),
        api.get('/users/branches/strength')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (strengthRes.data.success) {
        setBranchStrength(strengthRes.data.strength);
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Monitor college activities, student registrations, and photo-verified attendance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowActivityModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Create Activity</span>
          </button>
          <Link
            to="/admin/top-picks"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold rounded-xl transition-all"
          >
            <Award className="w-4 h-4 text-amber-700" />
            <span>Top 3 Picks</span>
          </Link>
          <Link
            to="/admin/leaderboard"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-bold rounded-xl transition-all"
          >
            <Trophy className="w-4 h-4 text-amber-700" />
            <span>Leaderboard</span>
          </Link>
          <Link
            to="/admin/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 border border-[#E8E2D5] text-xs font-bold rounded-xl transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-stone-500" />
            <span>Attendance Excel</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled in portal"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Activities"
          value={stats?.publishedActivities || 0}
          subtitle={`${stats?.totalActivities || 0} total created`}
          icon={Calendar}
          color="violet"
        />
        <StatCard
          title="Pending Photo Proofs"
          value={stats?.pendingSubmissions || 0}
          subtitle="Awaiting coordinator verification"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Verified Present"
          value={stats?.totalAttendances || 0}
          subtitle={`${stats?.attendanceRate || 0}% overall verification rate`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Branch Student Strength Breakdown Section */}
      {branchStrength && Object.keys(branchStrength).length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Branch Student Strength & Section Distribution</h3>
                <p className="text-xs text-stone-500">Breakdown of student strength by branch and academic sections</p>
              </div>
            </div>
            <Link
              to="/admin/students"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>Manage Directory</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {Object.entries(branchStrength).map(([branchName, bData]) => (
              <div
                key={branchName}
                className="p-4 rounded-2xl border border-[#E8E2D5] bg-[#FAF8F5] hover:border-amber-600/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-stone-900 truncate">{branchName}</h4>
                  <span className="text-xs font-bold text-amber-900 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md shrink-0">
                    Total: {bData.totalStudents}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {Object.entries(bData.sections || {}).map(([sec, count]) => (
                    <span
                      key={sec}
                      className="text-[11px] px-2 py-0.5 bg-white border border-[#E8E2D5] rounded-md font-medium text-stone-700 shadow-xs"
                    >
                      Sec {sec}: <strong className="text-stone-900 font-bold">{count}</strong>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Banner for Pending Reviews */}
      {stats?.pendingSubmissions > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                {stats.pendingSubmissions} photograph proof(s) need verification
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Review submitted student photos to confirm attendance and mark them Present (+100 club points).
              </p>
            </div>
          </div>
          <Link
            to="/admin/submissions?status=PENDING"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <span>Review Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Recent Activities Section */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <h2 className="font-bold text-stone-900 text-sm sm:text-base">Recent Activities & Registrations</h2>
          <Link
            to="/admin/activities"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E8E2D5]">
          {stats?.recentActivities?.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">No activities found.</div>
          ) : (
            stats?.recentActivities?.map((act) => (
              <div
                key={act.id}
                className="p-4 sm:px-6 hover:bg-[#FAF8F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{act.title}</h3>
                    <StatusBadge status={act.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    <span>Category: <strong className="text-stone-800">{act.category}</strong></span>
                    <span>•</span>
                    <span>Date: <strong className="text-stone-800">{new Date(act.eventDate).toLocaleDateString('en-GB')}</strong></span>
                    <span>•</span>
                    <span>Coordinators: <strong className="text-stone-800">{act.coordinators.join(', ') || 'Unassigned'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 bg-stone-100 text-stone-800 border border-[#E8E2D5] rounded-lg font-semibold">
                    {act.participantCount} registered
                  </span>
                  <Link
                    to={`/admin/attendance?activityId=${act.id}`}
                    className="p-1.5 text-stone-400 hover:text-amber-800 rounded-lg hover:bg-stone-100 transition-colors"
                    title="View Attendance"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showActivityModal && (
        <ActivityModal
          onClose={() => setShowActivityModal(false)}
          onSaved={fetchStats}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
