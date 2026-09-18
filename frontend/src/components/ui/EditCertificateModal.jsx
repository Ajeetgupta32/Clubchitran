import React, { useState } from 'react';
import { X, Save, Edit3, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const EditCertificateModal = ({ certificate, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    studentName: certificate?.studentName || certificate?.student?.user?.name || '',
    branch: certificate?.branch || certificate?.student?.branch || '',
    title: certificate?.title || '',
    description: certificate?.description || '',
    issuedDate: certificate?.issuedDate ? certificate.issuedDate.substring(0, 10) : ''
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
      const res = await api.put(`/certificates/admin/${certificate.id}`, formData);
      if (res.data.success) {
        toast.success(res.data.message || 'Certificate updated successfully!');
        if (onSaved) onSaved();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Edit Certificate Details</h3>
              <p className="text-xs text-stone-500">Modify serial ID: {certificate?.certificateNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Recipient Student Name *</label>
            <input
              type="text"
              required
              value={formData.studentName}
              onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Academic Department / Branch *</label>
            <input
              type="text"
              required
              value={formData.branch}
              onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Certificate Title / Honor *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Certificate of Excellence - Top 3 Pick"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Certificate Body / Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of achievement or recognition remarks..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 resize-none font-medium leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Issue Date</label>
            <input
              type="date"
              value={formData.issuedDate}
              onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-[#F5F0E8] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Saving Changes...' : 'Save Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCertificateModal;
