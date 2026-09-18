import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Search,
  Filter,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Camera,
  Download,
  ExternalLink,
  Trash2
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import PhotoReviewModal from '../../components/ui/PhotoReviewModal';
import toast from 'react-hot-toast';
import api from '../../services/api';
import downloadImage from '../../utils/downloadHelper';
import { resolveImageUrl } from '../../utils/imageUrl';

export const AdminSubmissions = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialActivityId = searchParams.get('activityId') || 'ALL';

  const [submissions, setSubmissions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [activityFilter, setActivityFilter] = useState(initialActivityId);
  const [branchFilter, setBranchFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ branches: [], sections: [] });

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const fetchMetaAndActivities = async () => {
    try {
      const [actRes, metaRes] = await Promise.all([
        api.get('/activities'),
        api.get('/users/meta/branches-sections')
      ]);
      if (actRes.data.success) {
        setActivities(actRes.data.activities || []);
      }
      if (metaRes.data.success) {
        setMeta({
          branches: metaRes.data.branches || [],
          sections: metaRes.data.sections || []
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions', {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
          activityId: activityFilter !== 'ALL' ? activityFilter : undefined,
          branch: branchFilter !== 'ALL' ? branchFilter : undefined,
          section: sectionFilter !== 'ALL' ? sectionFilter : undefined,
          search: search || undefined
        }
      });
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (error) {
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaAndActivities();
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, activityFilter, branchFilter, sectionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleDownload = async (e, sub) => {
    e.stopPropagation();
    try {
      const safeTitle = (sub.activityTitle || 'activity').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${sub.studentId || 'student'}_${safeTitle}_proof.jpg`;
      await downloadImage(sub.photoUrl, filename);
      toast.success('Downloading photo proof...');
    } catch {
      toast.error('Failed to download photo');
    }
  };

  const handleDeleteSubmission = async (e, sub) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to permanently delete this photo submitted by ${sub.studentName}?`)) {
      try {
        const res = await api.delete(`/submissions/${sub.id}`);
        if (res.data.success) {
          toast.success('Photograph deleted successfully');
          fetchSubmissions();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting photograph');
      }
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Photograph Proof Verifications
            </h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Admin oversight: review student photographs, download proofs, and verify attendance Present
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search by student name or roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E8E2D5] focus:outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Status filter pills */}
          <div className="flex items-center bg-[#F5F0E8] p-1 rounded-xl text-xs font-semibold border border-[#E8E2D5]">
            {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 max-w-[180px] truncate"
          >
            <option value="ALL">All Activities</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 max-w-[170px] truncate"
          >
            <option value="ALL">All Branches</option>
            {meta.branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
          >
            <option value="ALL">All Sec</option>
            {meta.sections.map((s) => (
              <option key={s} value={s}>Sec {s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-8 h-8 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5] shadow-xs">
          <Camera className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-sm">No photo submissions found</h3>
          <p className="text-xs text-stone-500 mt-1">There are currently no submissions matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-stone-400 transition-all hover:shadow-md group"
            >
              {/* Photo Thumbnail */}
              <div
                className="h-48 bg-stone-900 relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedSubmission(sub)}
              >
                <img
                  src={resolveImageUrl(sub.photoUrl)}
                  alt="Proof photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';
                  }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 rounded-xl text-xs font-bold shadow-md border border-stone-700">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Inspect</span>
                  </div>
                  <button
                    onClick={(e) => handleDownload(e, sub)}
                    className="p-1.5 bg-white/90 hover:bg-white rounded-xl text-stone-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
                    title="Download photograph"
                  >
                    <Download className="w-4 h-4 text-stone-900" />
                  </button>
                </div>

                <div className="absolute top-3 right-3">
                  <StatusBadge status={sub.status} />
                </div>
              </div>

              {/* Submission Information */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-stone-900 text-sm">{sub.studentName}</h3>
                    <p className="text-xs font-bold text-amber-800">{sub.studentId}</p>
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 bg-[#F5F0E8] px-2 py-0.5 rounded-lg border border-[#E8E2D5]">
                    Sec {sub.section}
                  </span>
                </div>

                <div className="mt-2.5 text-xs text-stone-600">
                  <p className="font-semibold text-stone-800 line-clamp-1">{sub.activityTitle}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Submitted: {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {sub.caption && (
                  <p className="mt-2.5 text-[11px] text-stone-600 italic bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D5] line-clamp-2">
                    "{sub.caption}"
                  </p>
                )}

                {sub.status === 'REJECTED' && sub.rejectionReason && (
                  <p className="mt-2.5 text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-xl line-clamp-2 border border-rose-200">
                    <strong>Rejection reason:</strong> {sub.rejectionReason}
                  </p>
                )}

                {/* Footer Action */}
                <div className="mt-auto pt-4 border-t border-[#E8E2D5] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-500">
                    {sub.branch.split(' ')[0]} ({sub.year.split(' ')[0]})
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleDownload(e, sub)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-lg transition-colors cursor-pointer"
                      title="Download photo to computer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteSubmission(e, sub)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Photograph"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedSubmission(sub)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        sub.status === 'PENDING'
                          ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                          : 'bg-[#F5F0E8] hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{sub.status === 'PENDING' ? 'Review & Verify' : 'View'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <PhotoReviewModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onUpdated={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default AdminSubmissions;
