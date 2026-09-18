import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  CheckSquare,
  FileSpreadsheet,
  Clock,
  Search
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const CoordActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activities', {
        params: {
          search: search || undefined,
          assignedOnly: 'true'
        }
      });
      if (res.data.success) {
        setActivities(res.data.activities || []);
      }
    } catch (error) {
      toast.error('Failed to load assigned activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivities();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Assigned Club Activities
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Activities where you are assigned as event coordinator
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </form>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs">
          <Calendar className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No assigned activities</h3>
          <p className="text-xs text-stone-500 mt-1">
            You currently have no activities assigned by the administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-stone-400 transition-all hover:shadow-md"
            >
              <div className="h-40 bg-stone-900 relative overflow-hidden">
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
                <div className="absolute top-3 right-3">
                  <StatusBadge status={act.status} />
                </div>
              </div>

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
                </div>

                <div className="mt-auto pt-4 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 bg-[#F5F0E8] border border-[#E8E2D5] px-2.5 py-1 rounded-lg">
                    {act.participantCount} Enrolled
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/coordinator/submissions?activityId=${act.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Review Proofs</span>
                    </Link>
                    <Link
                      to={`/coordinator/attendance?activityId=${act.id}`}
                      title="Attendance Sheet & Excel"
                      className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-[#F5F0E8] transition-colors"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoordActivities;
