import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Trophy
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import ActivityModal from '../../components/ui/ActivityModal';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';

export const AdminActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
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
  }, [statusFilter, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will delete all registrations, submissions, and attendances for this activity.`)) {
      try {
        const res = await api.delete(`/activities/${id}`);
        if (res.data.success) {
          toast.success('Activity deleted');
          fetchActivities();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting activity');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Club Activities</h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Create, manage, and assign coordinators to college events and hackathons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingActivity(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Activity</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
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

      {/* Activities Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No activities found</h3>
          <p className="text-xs text-stone-500 mt-1">Try modifying your search or create a new activity.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-stone-400 transition-all hover:shadow-md"
            >
              {/* Banner */}
              <div className="h-44 bg-stone-900 relative overflow-hidden">
                <img
                  src={resolveImageUrl(act.bannerUrl) || 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80'}
                  alt={act.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 bg-stone-950/80 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg uppercase tracking-wide border border-white/10">
                    {act.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={act.status} />
                </div>
              </div>

              {/* Details */}
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
                    <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">
                      Coord: {act.coordinators.map((c) => c.coordinator?.user?.name || 'Coord').join(', ') || 'None'}
                    </span>
                  </div>

                  {/* Certificate Status Badges */}
                  {(act.certificatesIssuedAt || act.physicalCertsIssuedAt) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      {act.certificatesIssuedAt && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          🎓 Certs Issued
                        </span>
                      )}
                      {act.physicalCertsIssuedAt && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                          🏆 Top Awards
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer and Actions */}
                <div className="mt-auto pt-4 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 bg-[#F5F0E8] border border-[#E8E2D5] px-2.5 py-1 rounded-lg">
                    {act.participantCount} Enrolled
                  </span>

                  <div className="flex items-center gap-1">
                    <Link
                      to="/admin/certificates"
                      title="Issue & Manage Certificates"
                      className="p-1.5 text-stone-500 hover:text-amber-700 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                    >
                      <Award className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/submissions?activityId=${act.id}`}
                      title="Review Submissions"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </Link>
                    <Link
                      to={`/admin/attendance?activityId=${act.id}`}
                      title="Attendance & Excel"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setEditingActivity(act);
                        setModalOpen(true);
                      }}
                      title="Edit Activity"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-[#F5F0E8] transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(act.id, act.title)}
                      title="Permanently Delete Activity"
                      className="p-1.5 text-stone-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <ActivityModal
          activity={editingActivity}
          onClose={() => setModalOpen(false)}
          onSaved={fetchActivities}
        />
      )}
    </div>
  );
};

export default AdminActivities;
