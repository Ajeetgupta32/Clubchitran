import React, { useState, useEffect } from 'react';
import { X, Award, User, Building2, Calendar, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const DirectIssueCertificateModal = ({ onClose, onIssued }) => {
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    branch: '',
    title: 'Certificate of Excellence & Outstanding Achievement',
    description: 'In recognition of exemplary photographic skill, creative vision, and artistic contribution to the Chitran Photography Club.',
    activityId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studRes, actRes] = await Promise.all([
          api.get('/users/students'),
          api.get('/activities/admin/all')
        ]);

        if (studRes.data.success) {
          setStudents(studRes.data.students || []);
        }
        if (actRes.data.success) {
          setActivities(actRes.data.activities || []);
        }
      } catch (err) {
        console.error('Error loading data for certificate issuance:', err);
        toast.error('Failed to load students or activities');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const selected = students.find((s) => s.id === sId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        studentId: sId,
        studentName: selected.name || selected.user?.name || '',
        branch: `${selected.branch || ''} ${selected.section ? `(Sec ${selected.section})` : ''}`.trim()
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        studentId: '',
        studentName: '',
        branch: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.studentName || !formData.branch || !formData.title) {
      toast.error('Please complete all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/certificates/admin/issue', {
        studentId: formData.studentId,
        studentName: formData.studentName,
        branch: formData.branch,
        title: formData.title,
        description: formData.description,
        activityId: formData.activityId || null
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Certificate issued successfully!');
        if (onIssued) onIssued(res.data.certificate);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-stone-900 text-base">Directly Issue Club Certificate</h3>
              <p className="text-xs text-stone-500">Issue an official verifiable certificate to any registered student</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Select Student *
            </label>
            <select
              value={formData.studentId}
              onChange={handleStudentSelect}
              required
              disabled={loading}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              <option value="">{loading ? 'Loading student directory...' : '-- Choose Recipient Student --'}</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name || s.user?.name} — {s.studentId ? `[Roll: ${s.studentId}]` : ''} ({s.branch || 'General'} {s.section ? `Sec ${s.section}` : ''})
                </option>
              ))}
            </select>
          </div>

          {/* Recipient Name & Branch (Editable) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                Certificate Recipient Name *
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="Full student name"
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
                placeholder="e.g. Computer Science & Engg"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
              />
            </div>
          </div>

          {/* Certificate Title */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Certificate Title / Honor *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Certificate of Excellence - Top 3 Photo Pick"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            />
          </div>

          {/* Related Event / Activity (Optional) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Associated Club Event / Activity (Optional)
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 font-medium"
            >
              <option value="">None / General Club Recognition</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} ({new Date(act.eventDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              Certificate Citation / Body Text
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Citation text that will appear in the certificate body..."
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
              disabled={submitting || !formData.studentId}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Issuing Certificate...' : 'Generate & Issue Certificate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DirectIssueCertificateModal;
