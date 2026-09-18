import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Upload,
  CheckCircle,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import PhotoUploadModal from '../../components/ui/PhotoUploadModal';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const StudentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [uploadModalActivity, setUploadModalActivity] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [registeringId, setRegisteringId] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities', {
        params: {
          search: search || undefined,
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined
        }
      });
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (error) {
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleRegister = async (activityId) => {
    try {
      setRegisteringId(activityId);
      const res = await api.post('/activities/register', { activityId });
      if (res.data.success) {
        toast.success('Successfully registered for activity!');
        fetchActivities();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error registering for activity');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Club Activities & Events
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Register for technical, cultural, and sports events, then submit photo proofs to earn attendance
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <form onSubmit={handleSearch} className="relative w-48">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
          </form>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
          >
            <option value="ALL">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Social">Social</option>
            <option value="Academic">Academic</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No activities available</h3>
          <p className="text-xs text-stone-500 mt-1">Check back later for new college club events!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => {
            const isRegistered = act.isRegistered;
            const submissionStatus = act.submissionStatus;
            const isPresent = act.attendanceStatus === 'PRESENT';
            const deadlinePassed = new Date() > new Date(act.deadline);

            return (
              <div
                key={act.id}
                className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-stone-400 transition-all hover:shadow-md"
              >
                {/* Banner */}
                <div className="h-44 bg-stone-900 relative overflow-hidden">
                  <img
                    src={act.bannerUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
                    alt={act.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-stone-950/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg uppercase tracking-wide border border-white/10">
                      {act.category}
                    </span>
                  </div>

                  {/* Registered Chip */}
                  {isRegistered && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-900/90 backdrop-blur-sm text-amber-400 text-xs font-bold rounded-lg shadow-xs border border-amber-500/30">
                        <Check className="w-3.5 h-3.5 text-amber-400" />
                        Enrolled
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-stone-900 text-base leading-snug line-clamp-1">{act.title}</h3>
                  <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">{act.description}</p>

                  <div className="space-y-1.5 mt-4 pt-3 border-t border-[#E8E2D5] text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{new Date(act.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{act.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Deadline: {new Date(act.deadline).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  {/* Dynamic Status / Action Section */}
                  <div className="mt-auto pt-4 border-t border-[#E8E2D5]">
                    {!isRegistered ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">
                          {act.participantCount} students joined
                        </span>
                        <button
                          onClick={() => handleRegister(act.id)}
                          disabled={deadlinePassed || registeringId === act.id}
                          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          {registeringId === act.id ? 'Registering...' : deadlinePassed ? 'Registration Closed' : 'Register Now'}
                        </button>
                      </div>
                    ) : isPresent ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <CheckCircle className="w-4 h-4 text-emerald-700" />
                          <span>Attendance Confirmed Present</span>
                        </div>
                      </div>
                    ) : submissionStatus === 'PENDING' ? (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <Clock className="w-4 h-4 text-amber-700" />
                          <span>Proof Pending Review</span>
                        </div>
                      </div>
                    ) : submissionStatus === 'REJECTED' ? (
                      <div className="space-y-2">
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                          <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-rose-950">Proof Rejected</p>
                            <p className="text-[11px] mt-0.5 text-rose-800 line-clamp-2">{act.latestSubmission?.rejectionReason}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setUploadModalActivity(act);
                            setRejectionReason(act.latestSubmission?.rejectionReason);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Re-upload Proof</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">Registered</span>
                        <button
                          onClick={() => {
                            setUploadModalActivity(act);
                            setRejectionReason(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                        >
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Upload Photo Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {uploadModalActivity && (
        <PhotoUploadModal
          activity={uploadModalActivity}
          previousRejectionReason={rejectionReason}
          onClose={() => {
            setUploadModalActivity(null);
            setRejectionReason(null);
          }}
          onUploaded={fetchActivities}
        />
      )}
    </div>
  );
};

export default StudentActivities;
