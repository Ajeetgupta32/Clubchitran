import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  CheckCircle,
  Clock,
  ArrowUpRight,
  FileSpreadsheet,
  Compass
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const CoordDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/coordinator');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching coordinator stats:', error);
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
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Coordinator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Welcome, <strong className="text-stone-900">{user?.name}</strong> • Department: {user?.coordinator?.department || 'Coordinator'}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/coordinator/submissions?status=PENDING"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Verify Submissions</span>
          </Link>
          <Link
            to="/coordinator/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold rounded-xl border border-[#E8E2D5] transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-stone-500" />
            <span>Excel Export</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Activities"
          value={stats?.totalAssignedActivities || 0}
          subtitle="Events under your supervision"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Pending Photo Proofs"
          value={stats?.pendingSubmissions || 0}
          subtitle="Awaiting your verification"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Verified Present"
          value={stats?.totalAttendances || 0}
          subtitle="Confirmed attendance records"
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Pending Proof Action Banner */}
      {stats?.pendingSubmissions > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                You have {stats.pendingSubmissions} student photograph proof(s) pending review!
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Students will only be marked Present once you verify and approve their photo submissions.
              </p>
            </div>
          </div>
          <Link
            to="/coordinator/submissions?status=PENDING"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <span>Review Submissions</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Assigned Activities List */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <h2 className="font-bold text-stone-900 text-sm sm:text-base">Your Assigned Activities</h2>
          <Link
            to="/coordinator/activities"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E8E2D5]">
          {stats?.assignedActivities?.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              No activities currently assigned to you. Admin assigns coordinators when publishing activities.
            </div>
          ) : (
            stats?.assignedActivities?.map((act) => (
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
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 bg-stone-100 border border-[#E8E2D5] text-stone-800 rounded-lg font-semibold">
                    {act.participantCount} registered
                  </span>
                  <Link
                    to={`/coordinator/submissions?activityId=${act.id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Review Proofs</span>
                  </Link>
                  <Link
                    to={`/coordinator/attendance?activityId=${act.id}`}
                    className="p-1.5 text-stone-400 hover:text-amber-800 rounded-lg hover:bg-stone-100 transition-colors"
                    title="Attendance Sheet"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};

export default CoordDashboard;
