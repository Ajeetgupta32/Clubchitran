import React, { useState } from 'react';
import { X, ShieldCheck, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const PromoteCoordinatorModal = ({ student, onClose, onSaved }) => {
  const [assignedBranch, setAssignedBranch] = useState(student?.branch || 'Computer Science & Engineering');
  const [assignedSection, setAssignedSection] = useState(student?.section || '');
  const [submitting, setSubmitting] = useState(false);

  const branches = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedBranch) {
      toast.error('Please assign a branch to the coordinator');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/users/promote-coordinator', {
        studentId: student.id,
        assignedBranch,
        assignedSection: assignedSection || null
      });

      if (res.data.success) {
        toast.success(`${student.name} promoted to Coordinator for ${assignedBranch}!`);
        onSaved();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to promote student to coordinator');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Promote to Coordinator</h3>
              <p className="text-xs text-stone-500">Upgrade student to Club Coordinator role</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E8E2D5]">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Student to Promote</p>
            <p className="text-sm font-bold text-stone-900 mt-0.5">{student?.name}</p>
            <p className="text-xs text-stone-500 mt-1">
              Roll ID: <span className="font-medium text-stone-700">{student?.studentId}</span> • Email: <span className="font-medium text-stone-700">{student?.email}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Assigned Branch * (Strict 1-Branch Rule)
            </label>
            <select
              value={assignedBranch}
              onChange={(e) => setAssignedBranch(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              The coordinator will only be able to view and manage student submissions from this assigned branch.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Assigned Section (Optional)
            </label>
            <select
              value={assignedSection}
              onChange={(e) => setAssignedSection(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              <option value="">All Sections in Branch</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
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
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'Promoting...' : 'Confirm Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteCoordinatorModal;
