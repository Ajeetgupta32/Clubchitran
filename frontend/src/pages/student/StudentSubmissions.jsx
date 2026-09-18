import React, { useState, useEffect } from 'react';
import {
  Camera,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Upload,
  Calendar,
  Eye,
  Filter,
  Award
} from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import PhotoUploadModal from '../../components/ui/PhotoUploadModal';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';

export const StudentSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [uploadModalActivity, setUploadModalActivity] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions', {
        params: {
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }
      });
      if (res.data.success) {
        setSubmissions(res.data.submissions || []);
      }
    } catch (error) {
      toast.error('Failed to load your submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E8E2D5] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            My Photograph Proofs & Verification History
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track the approval status of your participation proofs. Only verified proofs earn Present attendance.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center bg-[#F5F0E8] border border-[#E8E2D5] p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-stone-900 text-white shadow-xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
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
          <p className="text-xs text-stone-500 mt-1">
            Browse activities and upload your attendance photograph proof.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden flex flex-col hover:border-stone-400 transition-all hover:shadow-md"
            >
              {/* Image Preview */}
              <div
                className="h-48 bg-stone-900 relative overflow-hidden cursor-pointer group"
                onClick={() => setViewingPhoto(sub.photoUrl)}
              >
                <img
                  src={resolveImageUrl(sub.photoUrl)}
                  alt="Proof photograph"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900/90 backdrop-blur-md rounded-xl text-xs font-bold border border-stone-700">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span>View Full Image</span>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <StatusBadge status={sub.status} />
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-stone-900 text-base line-clamp-1">{sub.activityTitle}</h3>
                <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Submitted on {new Date(sub.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </p>

                {sub.caption && (
                  <p className="text-xs text-stone-600 mt-2.5 italic bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8E2D5]">
                    "{sub.caption}"
                  </p>
                )}

                {/* Top Pick Certificate Highlight */}
                {sub.isTopPick && (
                  <div className="mt-3 p-3 bg-[#FAF8F5] border border-amber-300 rounded-xl text-stone-900 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <p className="font-extrabold text-xs text-stone-900">Top Photo Pick!</p>
                        <p className="text-[11px] text-amber-800">Club Certificate Awarded</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-stone-900 text-amber-400 rounded-md font-black text-xs border border-amber-500/20">Rank #{sub.topPickRank}</span>
                  </div>
                )}

                {/* Status Specific Highlights */}
                <div className="mt-auto pt-4">
                  {sub.status === 'VERIFIED' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <p className="font-bold text-stone-900">Attendance Confirmed Present!</p>
                        {sub.verifiedBy && <p className="text-[11px] text-emerald-800">Verified by {sub.verifiedBy}</p>}
                      </div>
                    </div>
                  )}

                  {sub.status === 'PENDING' && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <p className="font-bold text-stone-900">Under Coordinator Review</p>
                        <p className="text-[11px] text-amber-800">Attendance will be marked once approved.</p>
                      </div>
                    </div>
                  )}

                  {sub.status === 'REJECTED' && (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 mb-1">
                          <AlertCircle className="w-4 h-4 text-rose-700" />
                          <span>Rejection Reason:</span>
                        </div>
                        <p className="text-[11px] text-rose-700">{sub.rejectionReason || 'Photograph did not meet verification criteria.'}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUploadModalActivity({ id: sub.activityId, title: sub.activityTitle });
                          setRejectionReason(sub.rejectionReason);
                        }}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-amber-400" />
                        <span>Re-upload Proof Photograph</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Photo Modal */}
      {viewingPhoto && (
        <div
          onClick={() => setViewingPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img src={resolveImageUrl(viewingPhoto)} alt="Full proof" className="max-w-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
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
          onUploaded={fetchSubmissions}
        />
      )}
    </div>
  );
};

export default StudentSubmissions;
