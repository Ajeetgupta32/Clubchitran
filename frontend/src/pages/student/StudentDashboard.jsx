import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Upload,
  Calendar,
  Sparkles,
  Award,
  Trophy,
  Gift,
  Medal
} from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import PhotoUploadModal from '../../components/ui/PhotoUploadModal';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [uploadModalActivity, setUploadModalActivity] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stats/student');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (error) {
      console.error('Error fetching student stats:', error);
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
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const rejectedItems = stats?.recentParticipations?.filter((p) => p.submissionStatus === 'REJECTED') || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-[#E8E2D5] rounded-3xl p-6 sm:p-8 text-stone-900 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-semibold mb-3 border border-amber-200/80 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Student Activity Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">
            Hi, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Roll: <strong className="text-stone-900">{user?.student?.studentId}</strong> • {user?.student?.branch} (Sec {user?.student?.section})
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/student/activities"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-stone-900 text-white hover:bg-stone-800 text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Explore Activities</span>
          </Link>
          <Link
            to="/student/submissions"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all"
          >
            <span>My Proofs</span>
          </Link>
        </div>
      </div>

      {/* Action Banner for Rejected Proofs */}
      {rejectedItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-950">
                Action Required: Photo proof rejected for "{rejectedItems[0].title}"
              </h3>
              <p className="text-xs text-rose-800 mt-1">
                <strong>Reason:</strong> {rejectedItems[0].rejectionReason || 'Please re-upload a clearer photograph.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setUploadModalActivity({ id: rejectedItems[0].activityId, title: rejectedItems[0].title });
              setRejectionReason(rejectedItems[0].rejectionReason);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Re-upload Photograph</span>
          </button>
        </div>
      )}

      {/* Monthly Award Recognition Banner */}
      {stats?.awardStatus && (
        <div className="bg-[#F5F0E8] border border-amber-200/80 rounded-3xl p-5 text-stone-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <Trophy className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-200 rounded-md">
                  Active Award
                </span>
                <h3 className="text-base font-black text-stone-900">Monthly Recognition: {stats.awardStatus}</h3>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Outstanding participation! You are eligible for an official Club Certificate & Physical Gift.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white text-amber-900 border border-amber-200/80 rounded-xl text-xs font-bold shadow-xs self-start sm:self-auto">
            <Gift className="w-4 h-4 text-amber-700" />
            <span>Award Recipient</span>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Club Points"
          value={`${stats?.points || 0} pts`}
          subtitle="+100 pts per verified proof"
          icon={Trophy}
          color="amber"
        />
        <StatCard
          title="Enrolled"
          value={stats?.totalEnrolled || 0}
          subtitle="Events registered"
          icon={Compass}
          color="violet"
        />
        <StatCard
          title="Present (Verified)"
          value={stats?.totalPresent || 0}
          subtitle="Confirmed attendance"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="Proofs Pending"
          value={stats?.pendingProofs || 0}
          subtitle="Awaiting review"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          subtitle="Verification completion"
          icon={CheckCircle}
          color="blue"
        />
      </div>

      {/* Recent Participations List */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between">
          <h2 className="font-bold text-stone-900 text-sm sm:text-base">My Registered Activities & Status</h2>
          <Link
            to="/student/submissions"
            className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1 transition-colors"
          >
            <span>View All Proofs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E8E2D5]">
          {stats?.recentParticipations?.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500">
              You haven't registered for any club activities yet. Explore available activities below!
            </div>
          ) : (
            stats?.recentParticipations?.map((part) => (
              <div
                key={part.activityId}
                className="p-4 sm:px-6 hover:bg-[#FAF8F5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 text-xs sm:text-sm">{part.title}</h3>
                    <span className="text-[11px] px-2 py-0.5 bg-stone-100 border border-[#E8E2D5] text-stone-700 rounded font-medium">
                      {part.category}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{new Date(part.eventDate).toLocaleDateString('en-GB')}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status */}
                  {part.isPresent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      Present (Verified)
                    </span>
                  ) : part.submissionStatus === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      Pending Approval
                    </span>
                  ) : part.submissionStatus === 'REJECTED' ? (
                    <button
                      onClick={() => {
                        setUploadModalActivity({ id: part.activityId, title: part.title });
                        setRejectionReason(part.rejectionReason);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Re-upload Proof</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setUploadModalActivity({ id: part.activityId, title: part.title });
                        setRejectionReason(null);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>Upload Proof</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {uploadModalActivity && (
        <PhotoUploadModal
          activity={uploadModalActivity}
          previousRejectionReason={rejectionReason}
          onClose={() => {
            setUploadModalActivity(null);
            setRejectionReason(null);
          }}
          onUploaded={fetchStats}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
