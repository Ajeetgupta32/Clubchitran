import React, { useState, useEffect } from 'react';
import { X, Send, Award, User, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export const RequestCertificateModal = ({ onClose, onSubmitted }) => {
  const [students, setStudents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    title: 'Certificate of Recognition for Outstanding Photography',
    reason: '',
    activityId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Coordinator can only access activities & students of their assigned branch
        const [actRes, studRes] = await Promise.all([
          api.get('/coordinator/activities'),
          api.get('/users/students')
        ]);

        if (actRes.data.success) {
          setActivities(actRes.data.activities || []);
        }

        if (studRes.data.success) {
          setStudents(studRes.data.students || []);
        }
      } catch (err) {
        console.error('Error fetching data for certificate request:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.title || !formData.reason) {
      toast.error('Please select a student and provide title & justification');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/certificates/request', {
        studentId: formData.studentId,
        title: formData.title,
        reason: formData.reason,
        activityId: formData.activityId || null
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Request submitted to Admin for approval!');
        if (onSubmitted) onSubmitted();
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting certificate request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#E8E2D5] animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#F5F0E8]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">Request Student Certificate</h3>
              <p className="text-xs text-stone-500">Ask Admin permission to issue official certificate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Select Student from Your Branch *
            </label>
            {loading ? (
              <p className="text-xs text-stone-400">Loading branch students...</p>
            ) : students.length === 0 ? (
              <div className="p-3 bg-[#FAF8F5] border border-[#E8E2D5] rounded-xl">
                <p className="text-xs text-amber-800 font-medium">
                  No verified students found yet in your assigned branch. You can type student details below.
                </p>
              </div>
            ) : (
              <select
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
              >
                <option value="">-- Choose Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.branch} Sec {s.section} • Roll: {s.studentId || s.rollNo})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Associated Club Activity / Event (Optional)
            </label>
            <select
              value={formData.activityId}
              onChange={(e) => setFormData({ ...formData, activityId: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
            >
              <option value="">General Club Recognition (No specific event)</option>
              {activities.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({new Date(a.eventDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Proposed Certificate Title / Honor *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Best Wildlife Portrait Award, Certificate of Distinction"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Justification & Recommendation for Admin *
            </label>
            <textarea
              rows="3"
              required
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Explain why this student deserves this certificate (e.g. Winner of theme challenge, exceptional framing skills)..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-[#E8E2D5] outline-none focus:ring-2 focus:ring-amber-700 bg-[#FDFCFB] text-stone-900 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8E2D5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.studentId}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-amber-400" />
              {submitting ? 'Submitting Request...' : 'Send Request to Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCertificateModal;
