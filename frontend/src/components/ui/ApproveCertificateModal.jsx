import React, { useState } from 'react';
import { X, CheckCircle, Award, User, Building2, FileText, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const ApproveCertificateModal = ({ request, onClose, onApproved }) => {
  const [formData, setFormData] = useState({
    studentName: request?.studentName || request?.student?.user?.name || '',
    branch: request?.branch || request?.student?.branch || '',
    title: request?.title || 'Certificate of Recognition for Photography Excellence',
    description: request?.reason || 'In recognition of outstanding artistic performance, exceptional creativity, and dedication to the Chitran Photography Club.'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.branch || !formData.title) {
      toast.error('Student name, branch, and title are required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/certificates/admin/requests/${request.id}/approve`, formData);
      if (res.data.success) {
        toast.success(res.data.message || 'Certificate approved and issued!');
        if (onApproved) onApproved(res.data.certificate);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Review & Approve Certificate</h3>
              <p className="text-xs text-stone-500">Review proposal details and customize certificate before issuance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coordinator Recommendation Info */}
        <div className="mx-6 mt-5 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D5] text-xs">
          <div className="flex items-center justify-between text-stone-600 mb-1">
            <span className="font-semibold text-stone-700">Proposed by Coordinator:</span>
            <span className="text-[#246A3E] font-bold">{request?.coordinator?.user?.name || 'Assigned Coordinator'}</span>
          </div>
          <div className="text-stone-600">
            <span className="font-semibold text-stone-700">Justification: </span>
            <span className="text-stone-600 italic">"{request?.reason}"</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Student Name on Certificate *
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Department / Branch *
              </label>
              <input
                type="text"
                required
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Certificate Title / Honor *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Official Body Text / Citation
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E8E2D5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-[#F5F0E8] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Issuing...' : 'Approve & Issue Certificate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveCertificateModal;
