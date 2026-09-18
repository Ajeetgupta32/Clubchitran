import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  MapPin,
  Tag,
  Download,
  ExternalLink,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import toast from 'react-hot-toast';
import api from '../../services/api';
import downloadImage from '../../utils/downloadHelper';
import { resolveImageUrl } from '../../utils/imageUrl';

export const PhotoReviewModal = ({ submission, onClose, onUpdated }) => {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!submission) return null;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const safeTitle = (submission.activityTitle || 'activity').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `${submission.studentId || 'student'}_${safeTitle}_proof.jpg`;
      await downloadImage(submission.photoUrl, filename);
      toast.success('Photograph download initiated!');
    } catch (err) {
      toast.error('Failed to download photograph');
    } finally {
      setDownloading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      const res = await api.patch(`/submissions/${submission.id}/verify`);
      if (res.data.success) {
        toast.success(res.data.message || 'Submission approved! Attendance marked Present.');
        onUpdated();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a rejection reason so the student knows what to fix.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.patch(`/submissions/${submission.id}/reject`, { reason });
      if (res.data.success) {
        toast.success('Submission rejected. Student can view reason and re-upload.');
        onUpdated();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject submission');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to permanently delete this photograph submitted by ${submission.studentName}?`)) {
      try {
        setSubmitting(true);
        const res = await api.delete(`/submissions/${submission.id}`);
        if (res.data.success) {
          toast.success('Photograph deleted successfully');
          onUpdated();
          onClose();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete photograph');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200 text-stone-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Photograph Proof Verification</h3>
              <p className="text-xs text-stone-500">Review student proof & confirm attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl border border-[#E8E2D5] transition-colors cursor-pointer"
              title="Download full size photo"
            >
              <Download className="w-3.5 h-3.5 text-stone-700" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer"
              title="Permanently Delete Photograph"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Status and Activity Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
            <div>
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Activity</span>
              <h4 className="text-sm font-bold text-stone-900">{submission.activityTitle}</h4>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  {new Date(submission.activityDate).toLocaleDateString('en-GB')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {submission.venue}
                </span>
              </div>
            </div>
            <StatusBadge status={submission.status} />
          </div>

          {/* Student Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-white rounded-2xl border border-[#E8E2D5]">
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase">Student Name</p>
              <p className="text-xs font-bold text-stone-900 mt-0.5 truncate">{submission.studentName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase">Roll / Student ID</p>
              <p className="text-xs font-bold text-stone-800 mt-0.5">{submission.studentId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase">Branch & Sec</p>
              <p className="text-xs font-semibold text-stone-700 mt-0.5 truncate">
                {submission.branch} ({submission.section})
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-500 uppercase">Year / Sem</p>
              <p className="text-xs font-semibold text-stone-700 mt-0.5">{submission.year} / {submission.semester}</p>
            </div>
          </div>

          {/* Photograph Display with Overlay Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700">Uploaded Proof Photograph</label>
              <button
                onClick={handleDownload}
                className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Computer</span>
              </button>
            </div>

            <div className="relative group rounded-2xl overflow-hidden border border-[#E8E2D5] bg-stone-900 max-h-80 flex items-center justify-center">
              <img
                src={resolveImageUrl(submission.photoUrl)}
                alt="Student Proof"
                className="max-h-80 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80';
                }}
              />

              {/* Hover Download Overlay */}
              <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download High-Res</span>
                </button>
                <a
                  href={resolveImageUrl(submission.photoUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/90 hover:bg-white text-stone-900 text-xs font-bold rounded-xl shadow-xs border border-white/50 transition-transform hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Full</span>
                </a>
              </div>
            </div>

            {submission.caption && (
              <p className="text-xs text-stone-700 mt-2.5 italic bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D5]">
                "{submission.caption}"
              </p>
            )}
          </div>

          {/* Status notices */}
          {submission.status === 'VERIFIED' && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Verified & Attendance Confirmed Present.</span>
                {submission.verifiedBy && <span> Verified by {submission.verifiedBy}.</span>}
              </div>
            </div>
          )}

          {submission.status === 'REJECTED' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900">
                <p className="font-bold">Submission Rejected</p>
                <p className="mt-0.5">Reason: {submission.rejectionReason}</p>
              </div>
            </div>
          )}

          {/* Rejection Form Input */}
          {rejecting && (
            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
              <label className="block text-xs font-bold text-rose-900">
                Rejection Reason (Required for Student Feedback)
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Photo is blurry; student face or college ID card is not identifiable. Please re-upload a clear picture."
                className="w-full text-xs p-3 rounded-xl border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejecting(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {submitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-700" />
            <span>Download Photo File</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Photo</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>

            {/* Verification buttons: only enabled when status is PENDING */}
            {submission.status === 'PENDING' && !rejecting && (
              <>
                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Proof
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleVerify}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  {submitting ? 'Verifying...' : 'Approve & Mark Present'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoReviewModal;
