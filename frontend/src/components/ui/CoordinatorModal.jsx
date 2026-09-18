import React, { useState } from 'react';
import { X, UserPlus, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const CoordinatorModal = ({ onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Coord@123',
    department: 'Computer Science & Engineering',
    assignedSection: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Applied Sciences & Humanities'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        assignedBranch: formData.department,
        assignedSection: formData.assignedSection || null
      };
      const res = await api.post('/users/coordinators', payload);
      if (res.data.success) {
        toast.success('Coordinator created successfully!');
        onSaved();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating coordinator');
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
              <Compass className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Add Club Coordinator</h3>
              <p className="text-xs text-stone-500">Assign faculty or staff coordinator privileges</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Coordinator Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Prof. Alan Turing"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="coordinator@college.edu"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Supervised Branch / Department *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Assigned Section (Optional)</label>
            <select
              value={formData.assignedSection}
              onChange={(e) => setFormData({ ...formData, assignedSection: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              <option value="">All Sections in Branch</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
              <option value="D">Section D</option>
            </select>
            <p className="text-[11px] text-stone-500 mt-1">
              If selected, coordinator can only view and manage students from this specific section.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Initial Password *</label>
              <input
                type="text"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D5]">
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
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Creating...' : 'Add Coordinator'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoordinatorModal;
